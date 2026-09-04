import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INDIAN_NAMES = [
  'Aarav Sharma', 'Priya Patel', 'Rohan Gupta', 'Ananya Verma', 'Vikram Singh',
  'Meera Iyer', 'Aditya Joshi', 'Kavya Nair', 'Rahul Mukherjee', 'Neha Reddy',
  'Siddharth Malhotra', 'Pooja Bhatia', 'Arjun Kapoor', 'Sanya Rao', 'Karan Mehta',
  'Divya Agarwal', 'Nikhil Choudhury', 'Shreya Banerjee', 'Varun Deshmukh', 'Ishita Saxena',
  'Rishabh Sundaram', 'Sneha Pillai', 'Gaurav Kulkarni', 'Tanvi Chawla', 'Amitabh Ghosh',
  'Ritu Bose', 'Manish Pandey', 'Swati Das', 'Deepak Hegde', 'Shruti Mishra'
];

const COMPANIES = [
  'TechCorp India', 'FinPay Solutions', 'CloudScale Technologies', 'Zomato Merchant Partner',
  'Swiggy Enterprise', 'Razorpay Partner Hub', 'FreshWorks Node', 'Zoho Reseller',
  'Paytm Merchant Cloud', 'Flipkart Vendor Ops', 'Jio Digital Enterprise', 'Tata Digital Hub',
  'Infosys BPO Node', 'Wipro Enterprise SaaS', 'InMobi Global Media', 'Nykaa Brand Partner',
  'PolicyBazaar Node', 'PhonePe Merchant Hub', 'Delhivery Logistics Partner', 'BigBasket Fulfillment'
];

const FAILURE_REASONS = [
  'insufficient_funds',
  'card_declined',
  'bank_timeout',
  'authentication_failed',
  'expired_card',
  'network_error',
  'mandate_failed',
  'checkout_abandoned'
];

const PAYMENT_METHODS = ['upi', 'card', 'netbanking', 'mandate', 'nach'];
const CUSTOMER_SEGMENTS = ['Enterprise', 'SMB', 'Startup', 'Consumer'];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomFloat(min: number, max: number, decimals: number = 2): number {
  const str = (Math.random() * (max - min) + min).toFixed(decimals);
  return parseFloat(str);
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🌱 Clearing existing database records...');
  await prisma.auditLog.deleteMany({});
  await prisma.recoveryAction.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.simulationRun.deleteMany({});
  await prisma.safetyRule.deleteMany({});

  console.log('🛡️ Seeding default Safety Rules...');
  const safetyRules = [
    {
      rule_key: 'MAX_PAYMENT_RETRIES',
      rule_value: '2',
      description: 'Maximum automated payment retry attempts permitted per transaction.',
      is_active: true
    },
    {
      rule_key: 'MAX_RECOVERY_COMMS',
      rule_value: '3',
      description: 'Maximum recovery communications (SMS/Email/WhatsApp links) allowed.',
      is_active: true
    },
    {
      rule_key: 'STOP_ON_SUCCESS',
      rule_value: 'true',
      description: 'Stop recovery workflow immediately once transaction is successfully recovered.',
      is_active: true
    },
    {
      rule_key: 'STOP_ON_OPT_OUT',
      rule_value: 'true',
      description: 'Halt all interventions if customer opts out of automated communications.',
      is_active: true
    },
    {
      rule_key: 'HUMAN_ESCALATION_THRESHOLD',
      rule_value: '2',
      description: 'Escalate to human operator after maximum automated retries fail.',
      is_active: true
    },
    {
      rule_key: 'REAL_PAYMENTS_DISABLED',
      rule_value: 'true',
      description: 'Strict policy prohibiting live monetary charges. All recovery executions are sandbox simulations.',
      is_active: true
    }
  ];

  for (const rule of safetyRules) {
    await prisma.safetyRule.create({ data: rule });
  }

  console.log('💳 Generating 105 synthetic transactions...');
  const transactionsToCreate = [];

  for (let i = 1; i <= 105; i++) {
    const txnId = `TXN_2026_${String(i).padStart(4, '0')}`;
    const name = getRandomItem(INDIAN_NAMES);
    const company = getRandomItem(COMPANIES);
    const isEnterprise = Math.random() > 0.6;
    const customerName = isEnterprise ? `${name} (${company})` : name;
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}@${company.toLowerCase().replace(/[^a-z]/g, '')}.co.in`;
    const customerId = `CUST_${getRandomInt(1000, 9999)}`;
    const segment = getRandomItem(CUSTOMER_SEGMENTS);
    const failureReason = getRandomItem(FAILURE_REASONS);
    const paymentMethod = getRandomItem(PAYMENT_METHODS);

    // Realistic amounts in INR
    const baseAmounts = [499, 999, 1499, 2999, 4999, 9999, 14999, 24999, 49999, 75000];
    const amount = getRandomItem(baseAmounts);

    const previousSuccessRate = getRandomFloat(0.35, 0.98);
    const daysSinceLastPayment = getRandomInt(1, 45);
    const attemptNumber = getRandomInt(1, 2);

    let riskScore = 0.5;
    if (failureReason === 'bank_timeout' || failureReason === 'network_error') {
      riskScore = getRandomFloat(0.15, 0.35);
    } else if (failureReason === 'insufficient_funds' || failureReason === 'card_declined') {
      riskScore = getRandomFloat(0.40, 0.70);
    } else if (failureReason === 'expired_card' || failureReason === 'mandate_failed') {
      riskScore = getRandomFloat(0.65, 0.92);
    }

    const riskLevel = riskScore > 0.7 ? 'high' : riskScore > 0.35 ? 'medium' : 'low';
    const subStatus = Math.random() > 0.9 ? 'opted_out' : (Math.random() > 0.2 ? 'past_due' : 'active');

    // Create realistic created_at within last 7 days
    const createdAt = new Date(Date.now() - getRandomInt(0, 7 * 24 * 3600 * 1000));

    transactionsToCreate.push({
      transaction_id: txnId,
      customer_id: customerId,
      customer_name: customerName,
      customer_email: email,
      amount: amount,
      currency: 'INR',
      payment_method: paymentMethod,
      failure_reason: failureReason,
      attempt_number: attemptNumber,
      created_at: createdAt,
      customer_segment: segment,
      subscription_status: subStatus,
      previous_success_rate: previousSuccessRate,
      days_since_last_payment: daysSinceLastPayment,
      invoice_status: 'unpaid',
      risk_score: riskScore,
      risk_level: riskLevel,
      recovery_status: 'at_risk',
      recovered_amount: 0.0,
      recovery_attempts: 0,
      communication_attempts: 0
    });
  }

  await prisma.transaction.createMany({
    data: transactionsToCreate
  });

  console.log(`✅ Successfully seeded 105 transactions and ${safetyRules.length} safety rules!`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
