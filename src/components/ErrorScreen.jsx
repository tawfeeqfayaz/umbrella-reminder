function ErrorScreen({ error, onRetry }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center">
      <div className="text-white text-center">
        <p className="text-2xl mb-4">Error: {error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-white/20 rounded-full hover:bg-white/30 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default ErrorScreen;
