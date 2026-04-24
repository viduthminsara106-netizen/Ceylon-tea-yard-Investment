import { useState } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How do I recharge my account?",
      answer: "Go to the Wallet page, click on 'Recharge', select your desired amount, and follow the payment instructions. Please make sure to upload the payment receipt to ensure fast processing."
    },
    {
      question: "What is the minimum withdrawal amount?",
      answer: "The minimum withdrawal amount is Rs 500. Withdrawals are typically processed within 24 hours."
    },
    {
      question: "How do I invite friends?",
      answer: "Go to the 'Referral Link' page, copy your unique invitation link, and share it with your friends. You will earn rewards when they sign up and recharge."
    },
    {
      question: "How does the daily income work?",
      answer: "Once you purchase a plan, your daily income will be automatically credited to your balance every day."
    },
    {
      question: "Can I buy multiple plans?",
      answer: "Yes, you can purchase multiple plans to increase your total daily earnings."
    },
    {
      question: "What should I do if my deposit is pending?",
      answer: "Deposits are reviewed manually. Please allow some time for the admin to verify your payment receipt. If it takes longer than 24 hours, contact customer support."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">FAQ</h1>
      </div>

      <div className="p-4 space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden transition-all">
            <button 
              className="w-full p-4 text-left flex justify-between items-center font-medium text-gray-800"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span className="pr-4">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp size={20} className="text-green-500 flex-shrink-0" />
              ) : (
                <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
              )}
            </button>
            {openIndex === index && (
              <div className="p-4 pt-0 text-gray-600 text-sm leading-relaxed">
                <div className="pt-3 border-t border-gray-100">
                  {faq.answer}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
