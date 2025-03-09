import React from 'react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

function Cta() {
  return (
    <>
          <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-blue-200 dark:from-black dark:to-yellow-950">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <Badge className="mb-2">Get Started Today</Badge>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ready to Transform Your Warehouse Operations?
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Join thousands of businesses that have optimized their warehouse management with our solution.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
                <Button size="lg" className="px-8">
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
