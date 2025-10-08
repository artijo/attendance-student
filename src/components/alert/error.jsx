function ErrorAlert({ title, message }) {
    return (
      <div role="alert" className="rounded-xl border border-gray-100 bg-white p-4">
        <div className="flex items-start gap-4">
          <span className="text-red-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-6 h-6"
              fill="#FA5252"
            >
              <path d="M24 3C12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21S35.6 3 24 3zm0 2c10.5 0 19 8.5 19 19s-8.5 19-19 19S5 34.5 5 24 13.5 5 24 5zm6.99 10.99a1 1 0 00-.7.3L24 22.59l-6.29-6.3a1 1 0 10-1.42 1.42L22.59 24l-6.3 6.29a1 1 0 101.42 1.42L24 25.41l6.29 6.3a1 1 0 001.42-1.42L25.41 24l6.3-6.29a1 1 0 00-.72-1.72z" />
            </svg>
          </span>
          <div className="flex-1">
            <strong className="block font-medium text-gray-900">{title}</strong>
            <p className="mt-1 text-sm text-gray-700">{message}</p>
          </div>
          <button className="text-gray-500 transition hover:text-gray-600">
            <span className="sr-only">Dismiss popup</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  }
  
  export default ErrorAlert;
  