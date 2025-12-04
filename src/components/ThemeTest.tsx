import { ThemeToggle } from "@/components/ThemeToggle"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

export function ThemeTest() {
  const { theme, setTheme } = useTheme()
  
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Theme Test</CardTitle>
          <CardDescription>
            Current theme: <span className="font-mono bg-muted px-2 py-1 rounded">{theme}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Theme Toggle</h3>
              <p className="text-sm text-muted-foreground">
                Click the button to switch between light and dark themes
              </p>
            </div>
            <ThemeToggle />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="bg-primary text-primary-foreground p-4 rounded-lg">
              <h4 className="font-medium">Primary</h4>
              <p className="text-sm">#0B74B0</p>
            </div>
            <div className="bg-secondary text-secondary-foreground p-4 rounded-lg">
              <h4 className="font-medium">Secondary</h4>
              <p className="text-sm">#75479C</p>
            </div>
            <div className="bg-accent text-accent-foreground p-4 rounded-lg">
              <h4 className="font-medium">Accent</h4>
              <p className="text-sm">#BD3861</p>
            </div>
          </div>
          
          <div className="pt-4">
            <h3 className="text-lg font-medium mb-2">Try it out!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use the theme toggle to switch between light and dark modes.
            </p>
            <div className="flex gap-2">
              <Button variant="default">Default Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="outline">Outline Button</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}