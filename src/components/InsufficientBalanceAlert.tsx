import { useEffect, useState } from 'react';
import { AlertTriangle, DollarSign } from 'lucide-react';
import { getUserBalance } from '@/lib/user-token-usage';
import { useRouter } from 'next/navigation';

interface InsufficientBalanceAlertProps {
  redirectTo?: string;
}

export function InsufficientBalanceAlert({ redirectTo = '/dashboard' }: InsufficientBalanceAlertProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkBalance = async () => {
      setIsLoading(true);
      try {
        const userBalance = await getUserBalance();
        setBalance(userBalance);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking balance:', error);
        setIsLoading(false);
      }
    };

    checkBalance();
  }, []);

  // If still loading, show a simple loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-pulse bg-amber-500/20 h-12 w-12 rounded-full mx-auto flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-amber-500" />
          </div>
          <p className="text-sm text-muted-foreground">Checking account balance...</p>
        </div>
      </div>
    );
  }

  // If balance is sufficient, return null (don't render anything)
  if (balance === null || balance > 0) {
    return null;
  }

  // If balance is zero or negative, show the alert
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg max-w-md w-full overflow-hidden">
        <div className="bg-amber-500/10 p-4 flex items-center gap-3 border-b border-border">
          <div className="bg-amber-500/20 h-10 w-10 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Insufficient Balance</h2>
            <p className="text-sm text-muted-foreground">
              Your account has no remaining credits
            </p>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-card/50 border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Current Balance:</span>
              <span className="text-lg font-semibold text-amber-500">$0.00</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You need credits to use AI features. Please add funds to your account to continue.
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <button 
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
              onClick={() => {
                // In a real app, this would navigate to a payment page
                alert('This would redirect to a payment page in production.');
              }}
            >
              Add Credits
            </button>
            
            <button 
              className="w-full py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg font-medium transition-colors"
              onClick={() => router.push(redirectTo)}
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}