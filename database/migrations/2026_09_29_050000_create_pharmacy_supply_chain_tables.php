<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The pharmacy module's inbound supply chain, ported from the Phermex project.
 *
 * Three changes to the original shape, each for a reason:
 *
 * 1. Every table carries facility_id and is tenant-scoped. Phermex keys stock
 *    to a pharmacy but its own tenancy trait resolves a user to *many*
 *    pharmacies, and several of its stock writers look drugs up with no tenant
 *    guard at all. Here one facility is one pharmacy, which is the guarantee
 *    the rest of TibaDesk is built on.
 *
 * 2. Stock is per batch, not a single blended quantity on the medicine. Phermex
 *    keeps one quantity and overwrites batch_number and expiry_date on every
 *    receipt, so receiving a new batch silently destroys the record of the old
 *    one and there is no FEFO order to dispense from. MedicineBatches replaces
 *    that, and a dispensed line names the batch it came from.
 *
 * 3. Suppliers, purchase orders, receipts, transfers, returns, write-offs and
 *    recalls are real tables that actually move stock. In Phermex a transfer
 *    decrements with nothing ever credited at the destination (stock simply
 *    disappears), a supplier return never touches quantity at all, and a
 *    damaged-goods write-off runs outside a transaction.
 */
return new class extends Migration
{
    public function up(): void
    {
        // MySQL has no transactional DDL, so a half-applied run leaves tables
        // behind. Clearing them makes the migration safe to retry.
        foreach (['medicine_batch_stocks', 'stock_locations', 'medicine_recall_dispositions', 'medicine_recalls', 'medicine_writeoffs', 'stock_return_items', 'stock_returns', 'stock_transfer_items', 'stock_transfers', 'purchase_order_items', 'purchase_orders', 'medicine_movements', 'medicine_batches', 'pharmacy_suppliers'] as $table) {
            Schema::dropIfExists($table);
        }

        // Phermex names transfer locations as free-text strings with no table
        // behind them, so stock is debited but never credited anywhere. Real
        // store rows make a transfer conserve stock.
        Schema::create('stock_locations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();

            $table->string('name');
            $table->string('code', 20);
            $table->string('kind', 20)->default('store');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['facility_id', 'code']);
            $table->index(['facility_id', 'is_active']);
        });

        Schema::create('pharmacy_suppliers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();

            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->string('tax_id')->nullable();
            $table->string('payment_terms', 20)->default('net_30');
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['facility_id', 'name']);
            $table->index(['facility_id', 'is_active']);
        });

        // Phermex has no VAT table and takes a client-supplied number, which
        // means the client chooses the tax. The rate lives with the medicine
        // and is copied onto the line so a later rate change cannot rewrite
        // history.
        Schema::create('medicine_batches', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();
            $table->foreignId('supplier_id')->nullable()
                ->constrained('pharmacy_suppliers')->nullOnDelete();

            $table->string('batch_number', 60);
            $table->date('expiry_date');
            $table->integer('quantity_received')->default(0);
            $table->integer('quantity_available')->default(0);
            $table->unsignedInteger('cost_price')->default(0);
            $table->date('received_on')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            // A batch is identified by its number within a medicine, and the
            // first to expire is the first to be used.
            $table->unique(['medicine_id', 'batch_number'], 'medicine_batches_number_unique');
            $table->index(['facility_id', 'expiry_date']);
            $table->index(['medicine_id', 'quantity_available']);
        });

        // Where a batch physically sits. A batch received into the main store
        // and transferred to a branch is one batch with two location balances,
        // which is what makes a transfer conserve rather than destroy stock.
        Schema::create('medicine_batch_stocks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('medicine_batch_id')
                ->constrained('medicine_batches')->cascadeOnDelete();
            $table->foreignId('stock_location_id')
                ->constrained('stock_locations')->cascadeOnDelete();

            $table->integer('quantity_on_hand')->default(0);
            $table->timestamps();

            $table->unique(['medicine_batch_id', 'stock_location_id'], 'mbs_batch_location_unique');
            $table->index(['facility_id', 'stock_location_id']);
        });

        Schema::create('medicine_movements', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();
            $table->foreignId('batch_id')->nullable()
                ->constrained('medicine_batches')->nullOnDelete();

            // A signed quantity in a single append-only journal. Positive is
            // stock in, negative is stock out, which is the only way a ledger
            // can be reconciled against on-hand quantity.
            $table->string('movement_type', 20);
            $table->integer('quantity');
            $table->unsignedInteger('unit_cost')->default(0);
            $table->string('reference_type', 40)->nullable();
            $table->string('reference_number', 60)->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['medicine_id', 'movement_type']);
            $table->index(['facility_id', 'created_at']);
            $table->index(['reference_type', 'reference_number']);
        });

        Schema::create('purchase_orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('supplier_id')->constrained('pharmacy_suppliers')->cascadeOnDelete();
            $table->foreignId('raised_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('received_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('order_number', 40);
            $table->string('status', 20)->default('draft');
            $table->date('ordered_on')->nullable();
            $table->date('expected_on')->nullable();
            $table->dateTime('received_at')->nullable();
            $table->unsignedInteger('total_value')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['facility_id', 'order_number']);
            $table->index(['facility_id', 'status']);
        });

        Schema::create('purchase_order_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('purchase_order_id')
                ->constrained('purchase_orders')->cascadeOnDelete();
            $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();

            $table->integer('quantity_ordered')->default(0);
            $table->integer('quantity_received')->default(0);
            // A pharmacy orders a specific batch and expiry, so the line
            // carries what to create on arrival rather than a guess at
            // receipt time.
            $table->string('batch_number', 60)->nullable();
            $table->date('expiry_date')->nullable();
            $table->unsignedInteger('unit_cost')->default(0);
            $table->unsignedInteger('line_total')->default(0);
            $table->timestamps();

            $table->index(['facility_id', 'purchase_order_id'], 'poi_facility_order_index');
        });

        Schema::create('stock_transfers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('from_location')->nullable();
            $table->foreignId('to_location')->nullable();
            $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('transfer_number', 40);
            $table->string('status', 20)->default('pending');
            $table->dateTime('approved_at')->nullable();
            $table->dateTime('shipped_at')->nullable();
            $table->dateTime('received_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['facility_id', 'transfer_number']);
            $table->index(['facility_id', 'status']);
        });

        Schema::create('stock_transfer_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('stock_transfer_id')
                ->constrained('stock_transfers')->cascadeOnDelete();
            $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();
            // A transfer moves a specific lot, not an abstract quantity: the
            // expiry travels with the goods, so the batch has to be named.
            $table->foreignId('medicine_batch_id')->constrained('medicine_batches')->cascadeOnDelete();

            $table->integer('quantity_sent')->default(0);
            $table->integer('quantity_received')->default(0);
            $table->timestamps();

            $table->index(['facility_id', 'stock_transfer_id'], 'sti_facility_transfer_index');
        });

        Schema::create('stock_returns', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('supplier_id')->constrained('pharmacy_suppliers')->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('return_number', 40);
            $table->string('reason', 30);
            $table->string('status', 20)->default('pending');
            $table->date('returned_on')->nullable();
            $table->unsignedInteger('total_value')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['facility_id', 'return_number']);
            $table->index(['facility_id', 'status']);
        });

        Schema::create('stock_return_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('stock_return_id')->constrained('stock_returns')->cascadeOnDelete();
            $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();
            $table->foreignId('batch_id')->nullable()
                ->constrained('medicine_batches')->nullOnDelete();

            $table->integer('quantity')->default(0);
            $table->unsignedInteger('unit_cost')->default(0);
            $table->timestamps();

            $table->index(['facility_id', 'stock_return_id'], 'sri_facility_return_index');
        });

        // Expired, damaged, contaminated, stolen or recalled stock, written off
        // in one place so the ledger always has a reason for the loss.
        Schema::create('medicine_writeoffs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();
            $table->foreignId('batch_id')->nullable()
                ->constrained('medicine_batches')->nullOnDelete();
            $table->foreignId('reported_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('reference_number', 40);
            $table->string('reason', 30);
            $table->integer('quantity')->default(0);
            $table->unsignedInteger('unit_cost')->default(0);
            $table->unsignedInteger('total_loss')->default(0);
            $table->string('disposal_method', 30)->default('documented_disposal');
            $table->date('written_off_on')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['facility_id', 'reference_number']);
            $table->index(['facility_id', 'reason']);
        });

        // A recall has to stop sales, not just be a note. Dispensing checks
        // this, so a recalled batch cannot be handed to a patient.
        Schema::create('medicine_recalls', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();
            $table->foreignId('batch_id')->nullable()
                ->constrained('medicine_batches')->nullOnDelete();
            $table->foreignId('reported_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('reference_number', 40);
            $table->string('recall_reason', 30);
            $table->string('severity', 20);
            $table->string('manufacturer', 120)->nullable();
            $table->date('issued_on')->nullable();
            $table->string('status', 20)->default('pending');
            $table->integer('affected_quantity')->default(0);
            $table->integer('returned_quantity')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['facility_id', 'reference_number']);
            $table->index(['medicine_id', 'status']);
        });

        // A write-off, return or transfer against a recalled batch lands here
        // so the recall can be closed out with a number behind it.
        Schema::create('medicine_recall_dispositions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('facility_id')->constrained()->cascadeOnDelete();
            $table->foreignId('medicine_recall_id')
                ->constrained('medicine_recalls')->cascadeOnDelete();

            $table->string('disposition', 30);
            $table->integer('quantity')->default(0);
            $table->unsignedInteger('unit_cost')->default(0);
            $table->dateTime('disposed_at')->nullable();
            $table->timestamps();

            $table->index(['facility_id', 'medicine_recall_id'], 'mrd_facility_recall_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medicine_recall_dispositions');
        Schema::dropIfExists('medicine_recalls');
        Schema::dropIfExists('medicine_writeoffs');
        Schema::dropIfExists('stock_return_items');
        Schema::dropIfExists('stock_returns');
        Schema::dropIfExists('stock_transfer_items');
        Schema::dropIfExists('stock_transfers');
        Schema::dropIfExists('purchase_order_items');
        Schema::dropIfExists('purchase_orders');
        Schema::dropIfExists('medicine_movements');
        // Children of medicine_batches have to go first or the foreign keys
        // block the drop.
        Schema::dropIfExists('medicine_batch_stocks');
        Schema::dropIfExists('medicine_batches');
        Schema::dropIfExists('stock_locations');
        Schema::dropIfExists('pharmacy_suppliers');
    }
};
