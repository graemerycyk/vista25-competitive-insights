import { Suspense } from 'react'
import Link from "next/link";

export default function Home() {
  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto bg-base-100 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-8 lg:py-20">
          <div className="flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start">
            <h1 className="font-extrabold text-4xl lg:text-6xl tracking-tight md:-mb-4">
              Monitor Your{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Competition
              </span>{" "}
              in Real-Time
            </h1>
            <p className="text-lg opacity-80 leading-relaxed max-w-md">
              Get instant alerts on competitor activities including layoffs, acquisitions, funding rounds, and executive changes. Stay ahead with automated intelligence.
            </p>
            <Link 
              href="/competitors" 
              className="btn btn-primary btn-wide gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              View Intelligence Dashboard
            </Link>
          </div>

          <div className="flex flex-col w-full lg:w-auto">
            {/* Demo Dashboard Preview */}
            <div className="mockup-window border border-base-300 bg-base-200 shadow-2xl max-w-lg">
              <div className="flex justify-center bg-base-200 px-4 py-16">
                <div className="w-full space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Competitor Intelligence</h3>
                    <div className="badge badge-success gap-2">
                      <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
                      Live
                    </div>
                  </div>
                  
                  {/* Sample competitor cards */}
                  <div className="space-y-3">
                    <div className="card bg-base-100 shadow-sm">
                      <div className="card-body p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">Acme Corp</h4>
                            <p className="text-sm opacity-70">ACME</p>
                          </div>
                          <div className="flex gap-2">
                            <div className="badge badge-error badge-sm">3 Important</div>
                            <div className="badge badge-neutral badge-sm">12 Total</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card bg-base-100 shadow-sm">
                      <div className="card-body p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold">Globex Inc</h4>
                            <p className="text-sm opacity-70">GLOB</p>
                          </div>
                          <div className="flex gap-2">
                            <div className="badge badge-error badge-sm">1 Important</div>
                            <div className="badge badge-neutral badge-sm">8 Total</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sample alert */}
                  <div className="alert alert-error shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="text-sm">
                      <div className="font-semibold">Acme Corp announces layoffs</div>
                      <div className="opacity-80">2 minutes ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}