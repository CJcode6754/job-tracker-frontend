import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
  code?: number;
  title?: string;
  message?: string;
}

export default function ErrorPage({ 
  code = 404, 
  title = "Page Not Found", 
  message = "Sorry, we couldn't find the page you're looking for." 
}: ErrorPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-8">
        <div className="space-y-4">
          <h1 className="text-9xl font-black text-primary/20 leading-none">
            {code}
          </h1>
          <h2 className="text-3xl font-bold text-base-content">
            {title}
          </h2>
          <p className="text-base-content/60">
            {message}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-ghost"
          >
            Go Back
          </button>
          <button 
            onClick={() => navigate('/')} 
            className="btn btn-primary"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
