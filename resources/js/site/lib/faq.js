export const faqCategories = ['All', 'General', 'Packages', 'Technical', 'Payment'];

export const faqQuestions = [
  {
    category: 'General',
    question: 'What is TibaDesk?',
    answer:
      'TibaDesk is a hospital management system for Tanzanian facilities. It covers patient records, appointments, billing, pharmacy, laboratory and reporting in one self-hosted package that you install on your own server.',
  },
  {
    category: 'General',
    question: 'Which edition should I choose?',
    answer:
      'Dental Clinic and Eye Clinic are built for single-specialty practices. Polyclinic adds multiple departments, laboratory, pharmacy and insurance claims. Hospital Management System adds admissions, wards, theatre and inpatient billing.',
  },
  {
    category: 'Packages',
    question: 'How does the subscription work?',
    answer:
      'You choose a package and a licence term of 3 months, 6 months or one year, then pay. As soon as the payment clears you can download the installer package together with a signed licence file carrying that exact term. Subscribe again when the term ends.',
  },
  {
    category: 'Packages',
    question: 'What happens when my licence expires?',
    answer:
      'The system keeps your records safe and readable, and stops accepting new registrations, billing and clinical entries until you upload a renewed licence. Nothing is ever locked behind a phone-home check.',
  },
  {
    category: 'Packages',
    question: 'Do I pay automatically each month?',
    answer:
      'No. There is no automatic debit. You decide when to renew by paying again for the coming month.',
  },
  {
    category: 'Payment',
    question: 'Which payment methods do you accept?',
    answer:
      'ClickPesa supports mobile money, card and bank transfer. The available methods are shown on the ClickPesa checkout screen.',
  },
  {
    category: 'Payment',
    question: 'Can I switch editions later?',
    answer:
      'Yes. You can subscribe to a larger edition at any time and pay the difference for the remainder of the month.',
  },
  {
    category: 'Technical',
    question: 'Do I need a server?',
    answer:
      'You need a server or VPS running Linux with PHP and MySQL, or one of the supported shared hosting platforms. We can install it for you if you prefer.',
  },
  {
    category: 'Technical',
    question: 'Is my patient data safe?',
    answer:
      'All data stays on your own server. Access is controlled by roles and permissions, and every change is recorded in an audit trail you can review.',
  },
  {
    category: 'Technical',
    question: 'Will you migrate my existing records?',
    answer:
      'Yes. We migrate your patients, services, price lists and opening balances so you can start on day one instead of retyping everything.',
  },
];
