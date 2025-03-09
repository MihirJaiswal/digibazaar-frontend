import React from 'react'
import Link from 'next/link';
import { Button } from '../ui/button'
import { ArrowRightIcon } from "@radix-ui/react-icons";
import TextShimmer from '../ui/text-shimmer';

function Cta() {
  return (
    <>
          <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white via-cyan-50 to-purple-100 dark:from-black dark:to-purple-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
              <TextShimmer className="inline-flex items-center justify-center">
                  <Link href="/signin">
                    <span>✨ Join us now</span>{" "}
                  </Link>
                  <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                </TextShimmer>
                        <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ready to Transform Your Warehouse Operations?
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg mt-1">
                  Join thousands of businesses that have optimized their warehouse management with our solution.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
                <Button size="lg" className="px-8 bg-gradient-to-r from-purple-500 to-cyan-500">
                  Start Free Trial
                </Button>
                <Button size="lg" variant="outline" className="px-8">
                  Schedule a Demo
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">No credit card required. 14-day free trial.</p>
            </div>
          </div>
        </section>
    </>
  )
} 
export default Cta;
