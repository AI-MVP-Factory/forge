export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8">
        {/* Welcome message - warm and inviting */}
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Welcome to <span className="text-primary-600">{{MVP_NAME}}</span>
        </h1>

        {/* Emotional hook - connects with user feelings */}
        <p className="text-xl text-gray-600 leading-relaxed">
          {{EMOTIONAL_HOOK}}
        </p>

        {/* Encouraging call to action */}
        <div className="space-y-4">
          <p className="text-lg text-gray-500">
            We're so glad you're here. Let's get started on something wonderful together.
          </p>

          <button className="rounded-full bg-primary-600 px-8 py-3 text-lg font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors">
            Get Started
          </button>
        </div>

        {/* Validation message - makes user feel supported */}
        <p className="text-sm text-gray-400">
          You're taking a great step. We're here to help every step of the way.
        </p>
      </div>
    </main>
  );
}
