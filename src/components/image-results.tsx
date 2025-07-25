"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Download, Copy, X, AlertCircle } from "lucide-react"
import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { RootState, AppDispatch } from "@/Redux/store"
import { clearError, clearImages, selectError, selectImages, selectIsLoading } from "@/Redux/slices/imageSlice"

export function ImageResults() {
  const dispatch:AppDispatch = useDispatch()
  const images = useSelector(selectImages)
  const isLoading = useSelector(selectIsLoading)
  const error = useSelector(selectError)
  const [copiedSeed, setCopiedSeed] = useState<string | null>(null)

  const handleDownload = async (url: string, seed: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = `fooocus-${seed}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  const handleCopySeed = (seed: string) => {
    navigator.clipboard.writeText(seed)
    setCopiedSeed(seed)
    setTimeout(() => setCopiedSeed(null), 2000)
  }

  const handleClearResults = () => {
    dispatch(clearImages())
  }

  const handleClearError = () => {
    dispatch(clearError())
  }

  if (!isLoading && !error && images.length === 0) {
    return null
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
            Generated Images
            {images.length > 0 && <Badge variant="secondary">{images.length}</Badge>}
          </CardTitle>
          {images.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearResults}>
              <X className="h-4 w-4 mr-2" />
              Clear Results
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={handleClearError}>
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Generating images...</p>
            </div>
          </div>
        )}

        {images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="space-y-3">
                <div className="relative group">
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={`Generated image ${index + 1}`}
                    className="w-full h-auto rounded-lg shadow-md"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleDownload(image.url, image.seed)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleCopySeed(image.seed)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={image.finish_reason === "SUCCESS" ? "default" : "destructive"}>
                      {image.finish_reason}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Seed:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 font-mono text-xs"
                        onClick={() => handleCopySeed(image.seed)}
                      >
                        {copiedSeed === image.seed ? "Copied!" : image.seed.slice(-8)}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
