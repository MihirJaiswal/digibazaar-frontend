import { Check, Globe, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const domains = [
  {
    id: 1,
    domain: "myawesomestore.com",
    status: "Active",
    ssl: true,
    primary: true,
    added: "2023-05-15",
  },
  {
    id: 2,
    domain: "shop.myawesomestore.com",
    status: "DNS Setup Required",
    ssl: false,
    primary: false,
    added: "2023-06-01",
  },
]

export function DomainsList() {
  return (
    <div className="space-y-4">
      {domains.map((domain) => (
        <div
          key={domain.id}
          className="flex flex-col space-y-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0"
        >
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{domain.domain}</span>
              {domain.primary && <Badge variant="outline">Primary</Badge>}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={domain.status === "Active" ? "default" : "secondary"}>{domain.status}</Badge>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {domain.ssl ? (
                  <>
                    <Check className="h-3 w-3 text-green-500" />
                    SSL Active
                  </>
                ) : (
                  <>
                    <X className="h-3 w-3 text-destructive" />
                    SSL Inactive
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button variant="outline" size="sm">
              Verify DNS
            </Button>
            <Button variant="outline" size="sm">
              Manage
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

