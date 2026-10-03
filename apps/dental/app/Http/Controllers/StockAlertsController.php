<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Medicine;
use App\Models\InventoryItem;

class StockAlertsController extends Controller
{
    /**
     * Get all inventory items with their alert statuses (for inventory management)
     */
    private function getInventoryItemsWithAlerts()
    {
        $items = InventoryItem::where('status', 'Active')->get();

        // Calculate alert statuses for each item
        $itemsWithAlerts = $items->map(function ($item) {
            $alerts = [];
            
            // Check if out of stock
            if (($item->balance <= $item->minimum_stock && $item->minimum_stock > 0) || $item->balance == 0) {
                $alerts[] = 'out_of_stock';
            }
            
            // Check if expired
            if ($item->has_expiry === 'Yes' && $item->expiry_date && Carbon::parse($item->expiry_date)->isPast()) {
                $alerts[] = 'expired';
            }
            
            // Check if expiring soon (within 90 days - 3 months)
            if ($item->has_expiry === 'Yes' && $item->expiry_date && 
                Carbon::parse($item->expiry_date)->isFuture() && 
                Carbon::parse($item->expiry_date)->diffInDays(Carbon::now()) <= 90) {
                $alerts[] = 'expiring_soon';
            }
            
            // Only return items that have at least one alert
            if (!empty($alerts)) {
                $item->alerts = $alerts;
                $item->alert_count = count($alerts);
                return $item;
            }
            
            return null;
        })->filter()->values();

        return $itemsWithAlerts;
    }

    /**
     * Get pharmaceutical items with their alert statuses (for medicine center)
     */
    private function getMedicineItemsWithAlerts()
    {
        $items = Medicine::where('status', 'Active')->get();

        // Calculate alert statuses for each item
        $itemsWithAlerts = $items->map(function ($item) {
            $alerts = [];
            
            // Check if out of stock
            if (($item->balance <= $item->minimum_stock && $item->minimum_stock > 0) || $item->balance == 0) {
                $alerts[] = 'out_of_stock';
            }
            
            // Check if expired
            if ($item->has_expiry === 'Yes' && $item->expiry_date && Carbon::parse($item->expiry_date)->isPast()) {
                $alerts[] = 'expired';
            }
            
            // Check if expiring soon (within 90 days - 3 months)
            if ($item->has_expiry === 'Yes' && $item->expiry_date && 
                Carbon::parse($item->expiry_date)->isFuture() && 
                Carbon::parse($item->expiry_date)->diffInDays(Carbon::now()) <= 90) {
                $alerts[] = 'expiring_soon';
            }
            
            // Only return items that have at least one alert
            if (!empty($alerts)) {
                $item->alerts = $alerts;
                $item->alert_count = count($alerts);
                return $item;
            }
            
            return null;
        })->filter()->values();

        return $itemsWithAlerts;
    }

    /**
     * Get out of stock items (including those that are also expired/expiring soon)
     */
    public function getOutOfStockItems()
    {
        try {
            $itemsWithAlerts = $this->getInventoryItemsWithAlerts();
            
            $outOfStockItems = $itemsWithAlerts->filter(function ($item) {
                return in_array('out_of_stock', $item->alerts);
            })->values();

            return response()->json([
                'success' => true,
                'data' => $outOfStockItems,
                'count' => $outOfStockItems->count(),
                'message' => 'Out of stock items retrieved successfully'
            ]);
        } catch (\Throwable $e) {
            \Log::error('Stock alerts out-of-stock failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => true,
                'data' => [],
                'count' => 0,
                'message' => 'Out of stock items retrieved successfully'
            ]);
        }
    }

    /**
     * Get expired items (including those that are also out of stock)
     */
    public function getExpiredItems()
    {
        try {
            $itemsWithAlerts = $this->getInventoryItemsWithAlerts();
            
            $expiredItems = $itemsWithAlerts->filter(function ($item) {
                return in_array('expired', $item->alerts);
            })->values();

            return response()->json([
                'success' => true,
                'data' => $expiredItems,
                'count' => $expiredItems->count(),
                'message' => 'Expired items retrieved successfully'
            ]);
        } catch (\Throwable $e) {
            \Log::error('Stock alerts expired failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => true,
                'data' => [],
                'count' => 0,
                'message' => 'Expired items retrieved successfully'
            ]);
        }
    }

    /**
     * Get items expiring soon (including those that are also out of stock)
     */
    public function getExpiringSoonItems()
    {
        try {
            $itemsWithAlerts = $this->getInventoryItemsWithAlerts();
            
            $expiringSoonItems = $itemsWithAlerts->filter(function ($item) {
                return in_array('expiring_soon', $item->alerts);
            })->values();

            return response()->json([
                'success' => true,
                'data' => $expiringSoonItems,
                'count' => $expiringSoonItems->count(),
                'message' => 'Expiring soon items retrieved successfully'
            ]);
        } catch (\Throwable $e) {
            \Log::error('Stock alerts expiring soon failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => true,
                'data' => [],
                'count' => 0,
                'message' => 'Expiring soon items retrieved successfully'
            ]);
        }
    }

    /**
     * Get all stock alerts summary (for inventory management)
     */
    public function getStockAlertsSummary()
    {
        try {
            $itemsWithAlerts = $this->getInventoryItemsWithAlerts();
            
            $outOfStockCount = $itemsWithAlerts->filter(function ($item) {
                return in_array('out_of_stock', $item->alerts);
            })->count();

            $expiredCount = $itemsWithAlerts->filter(function ($item) {
                return in_array('expired', $item->alerts);
            })->count();

            $expiringSoonCount = $itemsWithAlerts->filter(function ($item) {
                return in_array('expiring_soon', $item->alerts);
            })->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'out_of_stock_count' => $outOfStockCount,
                    'expired_count' => $expiredCount,
                    'expiring_soon_count' => $expiringSoonCount,
                    'total_alerts' => $outOfStockCount + $expiredCount + $expiringSoonCount,
                    'unique_items_with_alerts' => $itemsWithAlerts->count()
                ],
                'message' => 'Stock alerts summary retrieved successfully'
            ]);
        } catch (\Throwable $e) {
            \Log::error('Stock alerts summary failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => true,
                'data' => [
                    'out_of_stock_count' => 0,
                    'expired_count' => 0,
                    'expiring_soon_count' => 0,
                    'total_alerts' => 0,
                    'unique_items_with_alerts' => 0
                ],
                'message' => 'Stock alerts summary retrieved successfully'
            ]);
        }
    }

    /**
     * Get medicine-specific alerts (pharmaceutical items only)
     */
    public function getMedicineAlerts()
    {
        try {
            $itemsWithAlerts = $this->getMedicineItemsWithAlerts();
            
            $outOfStockMedicines = $itemsWithAlerts->filter(function ($item) {
                return in_array('out_of_stock', $item->alerts);
            })->values();

            $expiredMedicines = $itemsWithAlerts->filter(function ($item) {
                return in_array('expired', $item->alerts);
            })->values();

            $expiringSoonMedicines = $itemsWithAlerts->filter(function ($item) {
                return in_array('expiring_soon', $item->alerts);
            })->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'out_of_stock' => $outOfStockMedicines,
                    'expired' => $expiredMedicines,
                    'expiring_soon' => $expiringSoonMedicines,
                    'summary' => [
                        'out_of_stock_count' => $outOfStockMedicines->count(),
                        'expired_count' => $expiredMedicines->count(),
                        'expiring_soon_count' => $expiringSoonMedicines->count(),
                        'total_alerts' => $outOfStockMedicines->count() + $expiredMedicines->count() + $expiringSoonMedicines->count()
                    ]
                ],
                'message' => 'Medicine alerts retrieved successfully'
            ]);
        } catch (\Throwable $e) {
            \Log::error('Medicine alerts failed', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => true,
                'data' => [
                    'out_of_stock' => [],
                    'expired' => [],
                    'expiring_soon' => [],
                    'summary' => [
                        'out_of_stock_count' => 0,
                        'expired_count' => 0,
                        'expiring_soon_count' => 0,
                        'total_alerts' => 0
                    ]
                ],
                'message' => 'Medicine alerts retrieved successfully'
            ]);
        }
    }

    /**
     * Get medicine alerts summary (for medicine center dashboard)
     */
    public function getMedicineAlertsSummary()
    {
        $itemsWithAlerts = $this->getMedicineItemsWithAlerts();
        
        $outOfStockCount = $itemsWithAlerts->filter(function ($item) {
            return in_array('out_of_stock', $item->alerts);
        })->count();

        $expiredCount = $itemsWithAlerts->filter(function ($item) {
            return in_array('expired', $item->alerts);
        })->count();

        $expiringSoonCount = $itemsWithAlerts->filter(function ($item) {
            return in_array('expiring_soon', $item->alerts);
        })->count();

        return response()->json([
            'success' => true,
            'data' => [
                'out_of_stock_count' => $outOfStockCount,
                'expired_count' => $expiredCount,
                'expiring_soon_count' => $expiringSoonCount,
                'total_alerts' => $outOfStockCount + $expiredCount + $expiringSoonCount,
                'unique_items_with_alerts' => $itemsWithAlerts->count()
            ],
            'message' => 'Medicine alerts summary retrieved successfully'
        ]);
    }
}
