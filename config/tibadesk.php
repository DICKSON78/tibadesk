<?php

return [

    /*
    |---------------------------------------------------------------------------
    | Sales
    |---------------------------------------------------------------------------
    |
    | These three came across with the public website, which now lives in this
    | application rather than in front of it. They are what a subscription is
    | priced in, what admits the internal quote API, and where an enquiry or a
    | facility registration is delivered.
    |
    */

    'currency' => 'TZS',

    'quote_token' => env('TIBADESK_QUOTE_TOKEN'),

    'enquiry_inbox' => env('TIBADESK_ENQUIRY_INBOX', 'kadetech.online@gmail.com'),

    /*
    |--------------------------------------------------------------------------
    | Licence signing
    |--------------------------------------------------------------------------
    |
    | A paid subscription is signed into a licence the installed copy can
    | verify offline against the public key, so the private key stays on this
    | machine and never travels with the order.
    |
    */

    'licence' => [
        'private_key_path' => env('TIBADESK_LICENCE_KEY', storage_path('app/private/licence-private.key')),
        'public_key_path' => env('TIBADESK_LICENCE_PUBLIC_KEY', storage_path('app/private/licence-public.key')),
    ],

    /*
    |---------------------------------------------------------------------------
    | Purchasable installer packages
    |---------------------------------------------------------------------------
    |
    | Where the downloadable zip for each edition is kept. A subscription is
    | fulfilled by emailing this file, so an edition that has not been published
    | has no path here yet and the download answers 404 with a message saying so
    | rather than handing out a broken link.
    |
    | These keys must match the editions below.
    |
    */

    'artifacts' => [
        'package' => [
            'dental-clinic' => storage_path('app/private/packages/tibadesk-dental-clinic.zip'),
            'eye-clinic' => storage_path('app/private/packages/tibadesk-eye-clinic.zip'),
            'pharmacy' => storage_path('app/private/packages/tibadesk-pharmacy.zip'),
            'polyclinic' => storage_path('app/private/packages/tibadesk-polyclinic.zip'),
            'hospital' => storage_path('app/private/packages/tibadesk-hospital.zip'),
        ],
    ],

    /*
    |---------------------------------------------------------------------------
    | TibaDesk module catalogue
    |---------------------------------------------------------------------------
    |
    | This is the ERP's copy of the editions and modules the website sells. It
    | is the single place the running system asks "may this facility use the
    | dental module", so it must stay identical to the catalogue the website
    | publishes at /api/packages. Editions label what was sold; the actual
    | entitlement lives per facility in the facility_modules table, because a
    | facility can hold modules its edition does not name.
    |
    */

    'modules' => [

        'registration' => [
            'name' => 'Patient Registration & OPD',
            'icon' => 'clipboard',
            'summary' => 'Register a new patient with bio-data, phone, NIDA/ID and history, find an existing patient by name, phone or patient ID, schedule appointments, open a visit and print a queue ticket.',
            'requirements' => [
                'FR-01' => 'Register a new patient with bio-data, phone number, NIDA/ID and previous history',
                'FR-02' => 'Find an existing patient by name, phone number or patient ID / barcode',
                'FR-03' => 'Schedule appointments and view the doctor roster',
                'FR-04' => 'Open a new visit for a registered patient',
                'FR-05' => 'Print a queue card or ticket number',
            ],
        ],

        'consultation' => [
            'name' => 'Consultation',
            'icon' => 'stethoscope',
            'summary' => 'The doctor reads the full treatment history, records diagnosis, vitals and visit notes, writes the prescription straight to pharmacy, and raises laboratory orders from the same screen.',
            'requirements' => [
                'FR-06' => 'Doctor reviews the complete medical history of the patient',
                'FR-07' => 'Record diagnosis, vitals and consultation notes',
                'FR-08' => 'Write an e-prescription sent directly to Pharmacy',
                'FR-09' => 'Raise a laboratory order sent directly to Laboratory',
            ],
        ],

        'ipd' => [
            'name' => 'IPD & Bed Management',
            'icon' => 'hospital',
            'summary' => 'Admit a patient, see a live bed map per ward, transfer a patient between wards, and process discharge with the discharge report.',
            'requirements' => [
                'FR-10' => 'Admit a patient for inpatient care',
                'FR-11' => 'View bed occupancy by ward',
                'FR-12' => 'Transfer a patient between wards',
                'FR-13' => 'Process discharge and issue the discharge report',
            ],
        ],

        'pharmacy' => [
            'name' => 'Pharmacy',
            'icon' => 'pill',
            'summary' => 'Receive prescriptions from the doctor, control drug stock, warn on items close to expiry, and dispense against the stock so the shelf count and the patient bill agree.',
            'requirements' => [
                'FR-14' => 'Receive prescriptions from the doctor',
                'FR-15' => 'Control drug stock (inventory management)',
                'FR-16' => 'Alert on medicines approaching expiry',
                'FR-17' => 'Dispense and reduce stock automatically',
            ],
        ],

        'laboratory' => [
            'name' => 'Laboratory',
            'icon' => 'flask',
            'summary' => 'Receive lab orders from the doctor, enter test results, and release each result to the requesting doctor only.',
            'requirements' => [
                'FR-18' => 'Receive laboratory orders from the doctor',
                'FR-19' => 'Enter test results',
                'FR-20' => 'Release results to the requesting doctor',
            ],
        ],

        'billing' => [
            'name' => 'Billing & Insurance',
            'icon' => 'receipt',
            'summary' => 'Raise one invoice for everything the patient received, handle NHIF and private insurance claims, issue receipts, and report daily, weekly and monthly income.',
            'requirements' => [
                'FR-21' => 'Create an invoice for services delivered (consultation, medicines, tests, admission)',
                'FR-22' => 'Manage NHIF and private insurance claims',
                'FR-23' => 'Issue receipts',
                'FR-24' => 'Income reports for each day, week and month',
            ],
        ],

        'hr' => [
            'name' => 'HR & Payroll',
            'icon' => 'users',
            'summary' => 'Manage staff records, process payroll and track attendance, with no access to patient data.',
            'requirements' => [
                'FR-25' => 'Manage staff records',
                'FR-26' => 'Process payroll',
                'FR-27' => 'Track attendance',
            ],
        ],

        'reporting' => [
            'name' => 'Reporting & Analytics',
            'icon' => 'chart',
            'summary' => 'A whole-facility dashboard for patients seen, income and bed occupancy, departmental reports, and export to PDF or Excel.',
            'requirements' => [
                'FR-28' => 'Overall dashboard (daily patients, income, occupancy)',
                'FR-29' => 'Departmental reports (pharmacy stock, lab volume, billing summary)',
                'FR-30' => 'Export reports to PDF and Excel',
            ],
        ],

        'licensing' => [
            'name' => 'Licence Management',
            'icon' => 'shield',
            'summary' => 'The system runs on a valid licence key. A grace period covers a missed check-in, an expiring licence warns 30 days ahead, and an expired licence soft-locks into read-only so emergency records stay reachable.',
            'requirements' => [
                'FR-31' => 'A valid licence key or activation code is required to run the system',
                'FR-32' => 'Grace period when a check-in is missed',
                'FR-33' => 'On expiry the system soft-locks to view-only emergency records',
                'FR-34' => 'Expiry warning shown 30 days before expiry',
            ],
        ],

        'dental' => [
            'name' => 'Dental Module',
            'icon' => 'tooth',
            'summary' => 'A full odontogram of all 32 teeth that the doctor marks by clicking, treatment plans per tooth, a treatment history timeline, priced procedure codes wired to billing, recall scheduling and dental X-ray attachments.',
            'requirements' => [
                'FR-35' => 'Dental chart / odontogram of all 32 teeth with click-to-mark status per tooth',
                'FR-36' => 'Write a treatment plan per tooth or area',
                'FR-37' => 'Keep a treatment history timeline for follow-up visits',
                'FR-38' => 'Priced dental procedure codes linked one-to-one to billing',
                'FR-39' => 'Recall and follow-up appointment scheduling',
                'FR-40' => 'Attach dental X-ray images to the patient record',
            ],
        ],

        'eye' => [
            'name' => 'Eye Clinic Module',
            'icon' => 'eye',
            'summary' => 'Visual acuity for each eye, a printable refraction prescription, intraocular pressure for glaucoma screening, previous exam history for comparison, optical and frame stock, and internal referral between optometrist and ophthalmologist.',
            'requirements' => [
                'FR-41' => 'Record visual acuity per eye before and after treatment',
                'FR-42' => 'Refraction form with sphere, cylinder, axis and add, printable as a spectacle prescription',
                'FR-43' => 'Record intraocular pressure for glaucoma screening',
                'FR-44' => 'Keep previous examinations for quick comparison',
                'FR-45' => 'Link optical and frame stock to Pharmacy / inventory',
                'FR-46' => 'Referral between optometrist and ophthalmologist within the same clinic',
            ],
        ],

        'polyclinic' => [
            'name' => 'Polyclinic Multi-Specialty',
            'icon' => 'layers',
            'summary' => 'Create departments under one facility, each with its own consultation form, let a doctor cover more than one specialty, route the patient to the right queue at registration, and issue one consolidated invoice for a visit spanning several specialties.',
            'requirements' => [
                'FR-47' => 'Create specialty departments with their own consultation forms',
                'FR-48' => 'Assign a doctor to more than one specialty',
                'FR-49' => 'Reception selects the specialty and routes the patient to the right queue',
                'FR-50' => 'Consolidated invoice when one visit spans several specialties',
            ],
        ],

    ],

    'shared_modules' => [
        'registration',
        'consultation',
        'pharmacy',
        'laboratory',
        'billing',
        'reporting',
        'licensing',
    ],

    'editions' => [

        'dental-clinic' => [
            'name' => 'Dental Clinic',
            'tagline' => 'Odontogram, treatment planning and dental records for a single-chair practice.',
            'highlighted' => false,
            'limits' => [
                'users' => 10,
                'patients' => 'Unlimited',
                'stations' => 'Unlimited',
            ],
            'modules' => [
                'registration',
                'consultation',
                'dental',
                'pharmacy',
                'laboratory',
                'billing',
                'reporting',
                'licensing',
            ],
        ],

        'eye-clinic' => [
            'name' => 'Eye Clinic',
            'tagline' => 'Refraction, acuity and optical records for an optometry or ophthalmology practice.',
            'highlighted' => false,
            'limits' => [
                'users' => 10,
                'patients' => 'Unlimited',
                'stations' => 'Unlimited',
            ],
            'modules' => [
                'registration',
                'consultation',
                'eye',
                'pharmacy',
                'laboratory',
                'billing',
                'reporting',
                'licensing',
            ],
        ],

        'pharmacy' => [
            'name' => 'Pharmacy',
            'tagline' => 'Dispensing, medicine stock, purchase orders, sales and regulatory reporting for pharmacies.',
            'highlighted' => false,
            'limits' => [
                'users' => 10,
                'patients' => 'Unlimited',
                'stations' => 'Unlimited',
            ],
            'modules' => [
                'registration',
                'consultation',
                'pharmacy',
                'billing',
                'reporting',
                'licensing',
            ],
        ],

        'polyclinic' => [
            'name' => 'Polyclinic',
            'tagline' => 'Several specialties under one roof, sharing one patient file and one invoice.',
            'highlighted' => true,
            'limits' => [
                'users' => 25,
                'patients' => 'Unlimited',
                'stations' => 'Unlimited',
            ],
            'modules' => [
                'registration',
                'consultation',
                'polyclinic',
                'pharmacy',
                'laboratory',
                'billing',
                'reporting',
                'licensing',
            ],
        ],

        'hospital' => [
            'name' => 'Hospital Management',
            'tagline' => 'Admissions, wards, theatre and inpatient billing for mid-to-large hospitals.',
            'highlighted' => false,
            'limits' => [
                'users' => '50+',
                'patients' => 'Unlimited',
                'stations' => 'Unlimited',
            ],
            'modules' => [
                'registration',
                'consultation',
                'polyclinic',
                'ipd',
                'pharmacy',
                'laboratory',
                'billing',
                'hr',
                'reporting',
                'licensing',
            ],
        ],

    ],

    'licence_terms' => [
        ['key' => '3-months', 'months' => 3, 'label' => '3 months'],
        ['key' => '6-months', 'months' => 6, 'label' => '6 months'],
        ['key' => '12-months', 'months' => 12, 'label' => '1 year'],
    ],

    /*
    | The term a subscription is written against when nobody chose one. It has
    | to be one of the terms listed above: the column length and the validation
    | both assume it, and an order storing a term the catalogue does not offer
    | would be a licence the installer cannot check against the price paid.
    */
    'licence_term' => [
        'key' => '3-months',
        'months' => 3,
        'label' => '3 months',
    ],

    /*
    |---------------------------------------------------------------------------
    | Free trial
    |---------------------------------------------------------------------------
    |
    | A trial is a real facility with a real licence that expires on its own, not
    | a cut-down mode. That is deliberate: it means a trial exercises the same
    | code a paid customer runs, and it ends through the same mechanism, so
    | nothing about the paid path is special and nothing has to be switched off
    | afterwards. When the days run out the licence lapses and the facility
    | becomes read-only, which is the same thing that happens to a customer who
    | stops paying.
    |
    | `editions` is the list a visitor is allowed to try. Leaving an edition out
    | is how an unfinished one is kept off the shop floor: the endpoint refuses
    | it outright rather than granting a trial that cannot be used. An empty
    | list means no edition may be trialled at all.
    |
    */

    'trial' => [
        'enabled' => env('TIBADESK_TRIAL_ENABLED', true),
        'days' => (int) env('TIBADESK_TRIAL_DAYS', 14),
        'editions' => ['dental-clinic', 'eye-clinic', 'pharmacy', 'polyclinic', 'hospital'],

        // Nobody gets to open a thousand facilities by guessing addresses, and
        // a trial per address is what stops one person working through a list
        // of throwaway mailboxes. Both are enforced in StartTrialRequest, and
        // the route is throttled per address on top.
        'password_min_length' => 10,
    ],

    // Shown on the guest screens so a locked-out user has somewhere to go
    // that is not another form. Mirrors the website's SITE.contact block;
    // keep the two in step.
    'support' => [
        'phone' => env('TIBADESK_SUPPORT_PHONE', '+255 623 173 537'),
        'phoneHref' => env('TIBADESK_SUPPORT_PHONE_HREF', 'tel:+255623173537'),
        'email' => env('TIBADESK_SUPPORT_EMAIL', 'kadetech.online@gmail.com'),
    ],

    'deployment' => [
        ['code' => 'DEP-01', 'text' => 'Installed on a single server node inside the hospital, a Mini PC, NUC or existing PC'],
        ['code' => 'DEP-02', 'text' => 'PostgreSQL in Docker on that node'],
        ['code' => 'DEP-03', 'text' => 'Staff open the system in Chrome or Firefox over the LAN, nothing to install'],
        ['code' => 'DEP-04', 'text' => 'Reached by static IP or the mDNS name tibadesk.local'],
        ['code' => 'DEP-05', 'text' => 'Fully functional without internet for day-to-day work'],
        ['code' => 'DEP-06', 'text' => 'The server listens on the local network only, with no port forwarding'],
        ['code' => 'DEP-07', 'text' => 'Starts automatically when the machine is powered on'],
        ['code' => 'DEP-08', 'text' => 'Automatic daily database backups written to a separate or external drive'],
    ],

    'non_functional' => [
        ['code' => 'NFR-01', 'text' => 'Handles 10 to 50+ concurrent users without slowing down, on PostgreSQL rather than SQLite'],
        ['code' => 'NFR-02', 'text' => 'Sensitive data such as diagnosis and national ID is encrypted with a key the hospital owns'],
        ['code' => 'NFR-03', 'text' => 'Audit log of every important action: who viewed or changed what, and when'],
        ['code' => 'NFR-04', 'text' => 'Page loads in under 2 seconds on an ordinary LAN'],
        ['code' => 'NFR-05', 'text' => 'Handles sensitive personal and health data in line with Tanzania PDPA 2022'],
        ['code' => 'NFR-06', 'text' => 'Daily automatic database backup, restorable within one hour'],
        ['code' => 'NFR-07', 'text' => 'Usable by staff with limited computer experience, trainable in under 2 hours'],
    ],

    'all_modules' => [
        'name' => 'All Modules',
        'tagline' => 'Every module in TibaDesk, in one installation, scoped with you.',
        'action' => 'enquire',
    ],

];
