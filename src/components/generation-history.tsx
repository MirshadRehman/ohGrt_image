"use client"

import { AppDispatch } from "@/Redux/store"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Clock, ImageIcon } from "lucide-react"
import { clearHistory, removeImageFromHistory, selectHistory } from "@/Redux/slices/imageSlice"

export function GenerationHistory() {
  const dispatch:AppDispatch = useDispatch()
  const history = useSelector(selectHistory)

  const handleRemoveItem = (id: string) => {
    dispatch(removeImageFromHistory(id))
  }

  const handleClearHistory = () => {
    dispatch(clearHistory())
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  if (history.length === 0) {
    return null
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Generation History
            <Badge variant="secondary">{history.length}</Badge>
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleClearHistory}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear History
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {history.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{formatTimestamp(item.timestamp)}</span>
                    <Badge variant="outline">
                      {item.results.length} image{item.results.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {item.config?.prompt && (
                  <div className="text-sm">
                    <span className="font-medium">Prompt: </span>
                    <span className="text-muted-foreground">
                      {item.config.prompt.slice(0, 100)}
                      {item.config.prompt.length > 100 ? "..." : ""}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                  {item.results.slice(0, 4).map((result, index) => (
                    <img
                      key={index}
                      src={result.url || "/placeholder.svg"}
                      alt={`Generated ${index + 1}`}
                      className="w-full h-16 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
