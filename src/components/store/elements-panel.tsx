import { DragHandleDots2Icon } from "@radix-ui/react-icons"
import { Box, Columns, Heading, ImageIcon , LayoutGrid, List, MessageSquare, ShoppingCart, Type } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"

export function ElementsPanel() {
  return (
    <Accordion type="multiple" defaultValue={["layout", "content", "ecommerce"]} className="px-4 py-2">
      <AccordionItem value="layout">
        <AccordionTrigger>Layout Elements</AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-2">
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <DragHandleDots2Icon className="h-5 w-5 text-muted-foreground" />
                <Columns className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">Section</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <DragHandleDots2Icon className="h-5 w-5 text-muted-foreground" />
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">Grid</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <DragHandleDots2Icon className="h-5 w-5 text-muted-foreground" />
                <Box className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">Container</div>
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="content">
        <AccordionTrigger>Content Elements</AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-2">
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <DragHandleDots2Icon className="h-5 w-5 text-muted-foreground" />
                <Heading className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">Heading</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <DragHandleDots2Icon className="h-5 w-5 text-muted-foreground" />
                <Type className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">Text</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <DragHandleDots2Icon className="h-5 w-5 text-muted-foreground" />
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">Image</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <DragHandleDots2Icon className="h-5 w-5 text-muted-foreground" />
                <List className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">List</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <DragHandleDots2Icon className="h-5 w-5 text-muted-foreground" />
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">Contact Form</div>
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="ecommerce">
        <AccordionTrigger>E-commerce Elements</AccordionTrigger>
        <AccordionContent>
          <div className="grid gap-2">
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <DragHandleDots2Icon className="h-5 w-5 text-muted-foreground" />
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">Product Grid</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <DragHandleDots2Icon className="h-5 w-5 text-muted-foreground" />
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">Product Card</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <DragHandleDots2Icon className="h-5 w-5 text-muted-foreground" />
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">Add to Cart Button</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 flex items-center gap-3">
                <DragHandleDots2Icon className="h-5 w-5 text-muted-foreground" />
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">Cart Widget</div>
              </CardContent>
            </Card>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

