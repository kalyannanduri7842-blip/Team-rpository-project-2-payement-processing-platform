import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { ReceiptModal } from '../../components/ReceiptModal';
import {
  CreditCard,
  Building,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FileText,
  Lock,
} from 'lucide-react';

export const MakePaymentPage: React.FC = () => {
  const { user, profile } = useAuth();
  const toast = useToast();

  const [merchants, setMerchants] = useState<any[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  const [amount, setAmount] = useState('120.00');
  const [description, setDescription] = useState('E-commerce Purchase');
  const [paymentType, setPaymentType] = useState<'CREDIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET'>('CREDIT_CARD');

  // Card details
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardHolder, setCardHolder] = useState(user?.fullName || 'Alex Reynolds');

  // Bank details
  const [bankAccount, setBankAccount] = useState('9876543210');
  const [routingNumber, setRoutingNumber] = useState('021000021');

  // Distributed options
  const [idempotencyKey, setIdempotencyKey] = useState(`idemp_${Math.random().toString(36).substring(2, 9)}`);
  const [simulateDecline, setSimulateDecline] = useState(false);

  // Processing state machine
  const [step, setStep] = useState<'IDLE' | 'CREATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'>('IDLE');
  const [paymentResult, setPaymentResult] = useState<any | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    async function loadMerchants() {
      try {
        const res = await api.merchants.list();
        if (res.success && res.data && res.data.length > 0) {
          setMerchants(res.data);
          setSelectedMerchantId(res.data[0].id);
        }
      } catch (e) {}
    }
    loadMerchants();
  }, []);

  const handleSimulateCard = (type: 'valid' | 'fail' | 'high_risk') => {
    if (type === 'valid') {
      setCardNumber('4242 4242 4242 4242');
      setAmount('150.00');
      setSimulateDecline(false);
    } else if (type === 'fail') {
      setCardNumber('4000 0000 0000 0000');
      setAmount('75.00');
      setSimulateDecline(true);
    } else if (type === 'high_risk') {
      setCardNumber('4242 4242 4242 4242');
      setAmount('15000.00'); // Triggers academic fraud engine > 70 score!
      setSimulateDecline(false);
    }
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMerchantId || !amount || parseFloat(amount) <= 0) {
      toast.error('Validation Error', 'Please enter a valid merchant and amount.');
      return;
    }

    setStep('CREATED');
    setErrorDetails(null);
    setPaymentResult(null);

    // Step 1: Simulated Gateway Handshake
    setTimeout(async () => {
      setStep('PROCESSING');

      try {
        const finalCardNumber = simulateDecline ? '4000 0000 0000 0000' : cardNumber.replace(/\s+/g, '');
        const payload = {
          merchantId: selectedMerchantId,
          amount: parseFloat(amount),
          currency: 'USD',
          paymentMethodType: paymentType,
          paymentMethodDetails: {
            cardNumber: finalCardNumber,
            cardExpiry,
            cardCvc,
            cardHolderName: cardHolder,
            bankAccountNumber: bankAccount,
            bankRoutingNumber: routingNumber,
          },
          description,
          idempotencyKey,
        };

        const res = await api.payments.create(payload, idempotencyKey);

        if (res.success && res.data?.payment?.status === 'SUCCESS') {
          setStep('COMPLETED');
          setPaymentResult(res.data);
          toast.success('Payment Succeeded!', `Processed $${amount} to ${merchants.find(m => m.id === selectedMerchantId)?.businessName}`);

          // Fetch receipt
          if (res.data.transaction?.id) {
            const rRes = await api.transactions.getReceipt(res.data.transaction.id);
            if (rRes.success) setReceipt(rRes.data);
          }
        } else {
          setStep('FAILED');
          const reason = res.error?.message || res.data?.payment?.failureReason || 'Card declined by issuing simulator';
          setErrorDetails(reason);
          setPaymentResult(res.data);
          toast.error('Payment Failed', reason);
        }
      } catch (err: any) {
        setStep('FAILED');
        setErrorDetails(err.message || 'Gateway connection error');
        toast.error('Processing Exception', err.message);
      }
    }, 600);
  };

  const resetForm = () => {
    setStep('IDLE');
    setPaymentResult(null);
    setReceipt(null);
    setIdempotencyKey(`idemp_${Math.random().toString(36).substring(2, 9)}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-800" /> Make a Payment
        </h2>
        <p className="text-xs text-slate-500">
          Execute an end-to-end distributed transaction with atomic idempotency, fraud evaluation, and ledger updates.
        </p>
      </div>

      {/* Preset Demo Scenario Triggers */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Zap className="w-4 h-4 text-amber-500" /> Quick Simulation Scenarios:
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleSimulateCard('valid')}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-all shadow-xs"
          >
            ✓ Standard Success ($150)
          </button>
          <button
            type="button"
            onClick={() => handleSimulateCard('fail')}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all shadow-xs"
          >
            ✗ Bank Decline ($75)
          </button>
          <button
            type="button"
            onClick={() => handleSimulateCard('high_risk')}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-all shadow-xs"
          >
            🛡️ Fraud Flag Trigger ($15,000)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Form */}
        <div className="lg:col-span-7 space-y-4">
          <form onSubmit={handleProcessPayment} className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm space-y-4">
            {/* Merchant Select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Select Recipient Merchant</label>
              <select
                value={selectedMerchantId}
                onChange={e => setSelectedMerchantId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium transition-all"
              >
                {merchants.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.businessName} (Fee: {(m.commissionRate * 100).toFixed(1)}%)
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-700">Payment Amount ($ USD)</label>
                <span className="text-[11px] font-semibold text-emerald-800">Available: ${(profile?.balance || 8450).toFixed(2)}</span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.50"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-slate-900 placeholder-slate-400 transition-all"
                />
              </div>
              <div className="flex gap-2 pt-1">
                {['25.00', '50.00', '150.00', '500.00', '15000.00'].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 text-[11px] font-medium text-slate-600 transition-all"
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-700">Payment Instrument</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType('CREDIT_CARD')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    paymentType === 'CREDIT_CARD'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-700" /> Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('BANK_TRANSFER')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    paymentType === 'BANK_TRANSFER'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  <Building className="w-4 h-4 text-emerald-700" /> Bank (ACH)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType('DIGITAL_WALLET')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    paymentType === 'DIGITAL_WALLET'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                >
                  <Zap className="w-4 h-4 text-emerald-700" /> Wallet
                </button>
              </div>
            </div>

            {/* Card Inputs */}
            {paymentType === 'CREDIT_CARD' && (
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={e => setCardHolder(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">CVC</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={e => setCardCvc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Distributed System Idempotency Config */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" /> Idempotency Key (Distributed Safety)
                </span>
                <button
                  type="button"
                  onClick={() => setIdempotencyKey(`idemp_${Math.random().toString(36).substring(2, 9)}`)}
                  className="text-[10px] text-slate-500 hover:text-emerald-800 flex items-center gap-1 font-medium transition-colors"
                >
                  <RefreshCw className="w-2.5 h-2.5" /> regenerate
                </button>
              </div>
              <input
                type="text"
                value={idempotencyKey}
                onChange={e => setIdempotencyKey(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 rounded-xl px-3 py-1.5 text-[11px] font-mono text-slate-700 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={step === 'CREATED' || step === 'PROCESSING'}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {step === 'PROCESSING' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Processing Transaction...
                </>
              ) : (
                <>
                  Authorize & Pay ${parseFloat(amount || '0').toFixed(2)} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right column: Card Preview & Live State Machine Visualizer */}
        <div className="lg:col-span-5 space-y-4">
          {/* Credit Card Visual Graphic in Deep Forest Green */}
          <div className="bg-gradient-to-tr from-emerald-950 via-emerald-900 to-teal-900 border border-emerald-800/40 p-5 rounded-2xl shadow-lg relative overflow-hidden text-white flex flex-col justify-between h-48">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold tracking-wider text-emerald-200">PAYFLOW SECURE</span>
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="font-mono text-lg tracking-widest my-2 text-emerald-50">{cardNumber}</div>
            <div className="flex justify-between items-end text-xs">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-emerald-300">Card Holder</p>
                <p className="font-semibold uppercase truncate max-w-[140px] text-white">{cardHolder}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-wider text-emerald-300">Expires</p>
                <p className="font-mono font-semibold text-white">{cardExpiry}</p>
              </div>
            </div>
          </div>

          {/* Live Distributed State Machine Stepper */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Payment Lifecycle Pipeline</h4>
            <div className="space-y-3">
              {/* Step 1 */}
              <div className="flex items-start gap-3 text-xs">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                    step !== 'IDLE' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  1
                </div>
                <div>
                  <p className="font-semibold text-slate-800">1. CREATED</p>
                  <p className="text-[11px] text-slate-500">Idempotency reservation & input validation</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 text-xs">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                    ['PROCESSING', 'COMPLETED', 'FAILED'].includes(step)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  2
                </div>
                <div>
                  <p className="font-semibold text-slate-800">2. PROCESSING</p>
                  <p className="text-[11px] text-slate-500">Fraud scoring & simulated clearing</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 text-xs">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                    step === 'COMPLETED'
                      ? 'bg-emerald-800 text-white'
                      : step === 'FAILED'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  3
                </div>
                <div>
                  <p className="font-semibold text-slate-800">3. SETTLED / FAILED</p>
                  <p className="text-[11px] text-slate-500">Ledger record, events published to broker</p>
                </div>
              </div>
            </div>

            {/* Outcome banner */}
            {step === 'COMPLETED' && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Transaction Settled Successfully
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Ref: <span className="font-mono font-semibold">{paymentResult?.transaction?.referenceNumber}</span> | Risk Score: {paymentResult?.riskAssessment?.score}
                </p>
                <div className="flex gap-2 pt-1">
                  {receipt && (
                    <button
                      onClick={() => setReceipt(receipt)}
                      className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <FileText className="w-3 h-3" /> View Receipt
                    </button>
                  )}
                  <button onClick={resetForm} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-all">
                    New Payment
                  </button>
                </div>
              </div>
            )}

            {step === 'FAILED' && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <XCircle className="w-4 h-4 text-rose-600" /> Payment Declined
                </div>
                <p className="text-[11px] text-rose-800 leading-relaxed">{errorDetails}</p>
                <button onClick={resetForm} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-all">
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
    </div>
  );
};
