"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, Plus, Trash2, Loader2 } from "lucide-react"
import { ImageResults } from "@/components/image-results"
import { GenerationHistory } from "@/components/generation-history"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/Redux/store"
import { generateImages, selectIsLoading, setLastRequestConfig } from "@/Redux/slices/imageSlice"
import { FaAngleUp, FaAngleDown } from "react-icons/fa";

interface LoRAConfig {
  enabled: boolean
  model_name: string
  weight: number
}

interface ImagePrompt {
  cn_img: string
  cn_stop: number
  cn_weight: number
  cn_type: string
}

interface FoocusConfig {
  prompt: string
  negative_prompt: string
  style_selections: string[]
  performance_selection: string
  aspect_ratios_selection: string
  image_number: number
  image_seed: number
  sharpness: number
  guidance_scale: number
  base_model_name: string
  refiner_model_name: string
  refiner_switch: number
  loras: LoRAConfig[]
  advanced_params: Record<string, any>
  save_meta: boolean
  meta_scheme: string
  save_extension: string
  save_name: string
  read_wildcards_in_order: boolean
  require_base64: boolean
  async_process: boolean
  webhook_url: string
  input_image: string
  input_mask: string
  inpaint_additional_prompt: string
  outpaint_selections: string[]
  outpaint_distance_left: number
  outpaint_distance_right: number
  outpaint_distance_top: number
  outpaint_distance_bottom: number
  image_prompts: ImagePrompt[]
}

const defaultConfig: FoocusConfig = {
  prompt: "",
  negative_prompt: "",
  style_selections: ["Fooocus V2", "Fooocus Enhance", "Fooocus Sharp"],
  performance_selection: "Speed",
  aspect_ratios_selection: "1152*896",
  image_number: 1,
  image_seed: -1,
  sharpness: 2,
  guidance_scale: 4,
  base_model_name: "juggernautXL_v8Rundiffusion.safetensors",
  refiner_model_name: "None",
  refiner_switch: 0.5,
  loras: [
    { enabled: true, model_name: "sd_xl_offset_example-lora_1.0.safetensors", weight: 0.1 },
    { enabled: true, model_name: "None", weight: 1 },
    { enabled: true, model_name: "None", weight: 1 },
    { enabled: true, model_name: "None", weight: 1 },
    { enabled: true, model_name: "None", weight: 1 },
  ],
  advanced_params: {
    adaptive_cfg: 7,
    adm_scaler_end: 0.3,
    adm_scaler_negative: 0.8,
    adm_scaler_positive: 1.5,
    black_out_nsfw: false,
    canny_high_threshold: 128,
    canny_low_threshold: 64,
    clip_skip: 2,
    controlnet_softness: 0.25,
    debugging_cn_preprocessor: false,
    debugging_dino: false,
    debugging_enhance_masks_checkbox: false,
    debugging_inpaint_preprocessor: false,
    dino_erode_or_dilate: 0,
    disable_intermediate_results: false,
    disable_preview: false,
    disable_seed_increment: false,
    freeu_b1: 1.01,
    freeu_b2: 1.02,
    freeu_enabled: false,
    freeu_s1: 0.99,
    freeu_s2: 0.95,
    inpaint_advanced_masking_checkbox: true,
    inpaint_disable_initial_latent: false,
    inpaint_engine: "v2.6",
    inpaint_erode_or_dilate: 0,
    inpaint_respective_field: 1,
    inpaint_strength: 1,
    invert_mask_checkbox: false,
    mixing_image_prompt_and_inpaint: false,
    mixing_image_prompt_and_vary_upscale: false,
    overwrite_height: -1,
    overwrite_step: -1,
    overwrite_switch: -1,
    overwrite_upscale_strength: -1,
    overwrite_vary_strength: -1,
    overwrite_width: -1,
    refiner_swap_method: "joint",
    sampler_name: "dpmpp_2m_sde_gpu",
    scheduler_name: "karras",
    skipping_cn_preprocessor: false,
    vae_name: "Default (model)",
  },
  save_meta: true,
  meta_scheme: "fooocus",
  save_extension: "png",
  save_name: "",
  read_wildcards_in_order: false,
  require_base64: false,
  async_process: false,
  webhook_url: "",
  input_image: "string",
  input_mask: "",
  inpaint_additional_prompt: "",
  outpaint_selections: [],
  outpaint_distance_left: -1,
  outpaint_distance_right: -1,
  outpaint_distance_top: -1,
  outpaint_distance_bottom: -1,
  image_prompts: [
    { cn_img: "string", cn_stop: 0, cn_weight: 0, cn_type: "ImagePrompt" },
    { cn_img: "string", cn_stop: 0.5, cn_weight: 0.6, cn_type: "ImagePrompt" },
  ],
}

const styleOptions = [
  "Fooocus V2",
  "Fooocus Enhance",
  "Fooocus Sharp",
  "Fooocus Negative",
  "SAI 3D Model",
  "SAI Analog Film",
  "SAI Anime",
  "SAI Cinematic",
  "SAI Comic Book",
  "SAI Craft Clay",
  "SAI Digital Art",
  "SAI Enhance",
  "SAI Fantasy Art",
  "SAI Isometric",
  "SAI Line Art",
  "SAI Lowpoly",
  "SAI Neonpunk",
  "SAI Origami",
  "SAI Photographic",
  "SAI Pixel Art",
  "SAI Texture",
]

const performanceOptions = ["Speed", "Quality", "Extreme Speed"]
const aspectRatioOptions = [
  {
    name: 'portrait',
    value: "704*1408"
  },
  {
    name: 'Square',
    value: "1024*1024"
  },
  {
    name: 'Landscape',
    value: "1408*704"
  }
]

export default function FoocusConfigForm() {
  const [config, setConfig] = useState<FoocusConfig>(defaultConfig)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const updateConfig = (path: string, value: any) => {
    setConfig((prev) => {
      const newConfig = { ...prev }
      const keys = path.split(".")
      let current: any = newConfig

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value

      return newConfig
    })
  }

  const updateLoRA = (index: number, field: keyof LoRAConfig, value: any) => {
    const newLoras = [...config.loras]
    newLoras[index] = { ...newLoras[index], [field]: value }
    setConfig((prev) => ({ ...prev, loras: newLoras }))
  }

  const addLoRA = () => {
    setConfig((prev) => ({
      ...prev,
      loras: [...prev.loras, { enabled: true, model_name: "None", weight: 1 }],
    }))
  }

  const removeLoRA = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      loras: prev.loras.filter((_, i) => i !== index),
    }))
  }

  const updateImagePrompt = (index: number, field: keyof ImagePrompt, value: any) => {
    const newPrompts = [...config.image_prompts]
    newPrompts[index] = { ...newPrompts[index], [field]: value }
    setConfig((prev) => ({ ...prev, image_prompts: newPrompts }))
  }
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {

    const files = e.target.files;
    if (!files) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result as string; // e.g., "data:image/png;base64,..."
      updateImagePrompt(index, "cn_img", base64String);
    };

    reader.readAsDataURL(file); // Converts file to base64
  };


  const addImagePrompt = () => {
    setConfig((prev) => ({
      ...prev,
      image_prompts: [...prev.image_prompts, { cn_img: "", cn_stop: 0.5, cn_weight: 0.6, cn_type: "ImagePrompt" }],
    }))
  }

  const removeImagePrompt = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      image_prompts: prev.image_prompts.filter((_, i) => i !== index),
    }))
  }

  const dispatch: AppDispatch = useDispatch()
  const isLoading = useSelector(selectIsLoading)

  const handleSubmit = async () => {
    // Store the config for history
    dispatch(setLastRequestConfig(config))

    // Dispatch the generate images action
    dispatch(generateImages(config))
  }

  const [openInputimages, setopenInputimages] = useState(false)

  return (
    <div className="container mx-auto p-6 max-w-4xl text-neutral-700">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Fooocus Configuration</h1>
        <p className="text-muted-foreground">Configure your AI image generation parameters</p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="models">Models & LoRA</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="output">Output</TabsTrigger>
          <TabsTrigger value="input">Input/Prompts</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Settings</CardTitle>
              <CardDescription>Core image generation parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe what you want to generate..."
                  value={config.prompt}
                  onChange={(e) => updateConfig("prompt", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="negative_prompt">Negative Prompt</Label>
                <Textarea
                  id="negative_prompt"
                  placeholder="Describe what you don't want..."
                  value={config.negative_prompt}
                  onChange={(e) => updateConfig("negative_prompt", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Performance</Label>
                  <Select
                    value={config.performance_selection}
                    onValueChange={(value) => updateConfig("performance_selection", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {performanceOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <Select
                    value={config.aspect_ratios_selection}
                    onValueChange={(value) => updateConfig("aspect_ratios_selection", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatioOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image_number">Image Count</Label>
                  <Input
                    id="image_number"
                    type="number"
                    min="1"
                    max="8"
                    value={config.image_number}
                    onChange={(e) => updateConfig("image_number", Number.parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_seed">Seed (-1 for random)</Label>
                  <Input
                    id="image_seed"
                    type="number"
                    value={config.image_seed}
                    onChange={(e) => updateConfig("image_seed", Number.parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sharpness: {config.sharpness}</Label>
                  <Slider
                    value={[config.sharpness]}
                    onValueChange={([value]) => updateConfig("sharpness", value)}
                    min={0}
                    max={30}
                    step={0.1}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Guidance Scale: {config.guidance_scale}</Label>
                <Slider
                  value={[config.guidance_scale]}
                  onValueChange={([value]) => updateConfig("guidance_scale", value)}
                  min={1}
                  max={30}
                  step={0.1}
                />
              </div>

              <div className="space-y-2">
                <Label>Style Selections</Label>
                <div className="flex flex-wrap gap-2">
                  {styleOptions.map((style) => (
                    <Badge
                      key={style}
                      variant={config.style_selections.includes(style) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        const newStyles = config.style_selections.includes(style)
                          ? config.style_selections.filter((s) => s !== style)
                          : [...config.style_selections, style]
                        updateConfig("style_selections", newStyles)
                      }}
                    >
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Settings</CardTitle>
              <CardDescription>Base model and refiner configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="base_model">Base Model</Label>
                <Input
                  id="base_model"
                  value={config.base_model_name}
                  onChange={(e) => updateConfig("base_model_name", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="refiner_model">Refiner Model</Label>
                  <Input
                    id="refiner_model"
                    value={config.refiner_model_name}
                    onChange={(e) => updateConfig("refiner_model_name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Refiner Switch: {config.refiner_switch}</Label>
                  <Slider
                    value={[config.refiner_switch]}
                    onValueChange={([value]) => updateConfig("refiner_switch", value)}
                    min={0}
                    max={1}
                    step={0.01}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>LoRA Settings</CardTitle>
              <CardDescription>Configure LoRA models and weights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.loras.map((lora, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={lora.enabled}
                        onCheckedChange={(checked) => updateLoRA(index, "enabled", checked)}
                      />
                      <Label>LoRA {index + 1}</Label>
                    </div>
                    {config.loras.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => removeLoRA(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Model Name</Label>
                      <Input
                        value={lora.model_name}
                        onChange={(e) => updateLoRA(index, "model_name", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Weight: {lora.weight}</Label>
                      <Slider
                        value={[lora.weight]}
                        onValueChange={([value]) => updateLoRA(index, "weight", value)}
                        min={-2}
                        max={2}
                        step={0.01}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button onClick={addLoRA} variant="outline" className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add LoRA
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Parameters</CardTitle>
              <CardDescription>Fine-tune generation parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Adaptive CFG: {config.advanced_params.adaptive_cfg}</Label>
                  <Slider
                    value={[config.advanced_params.adaptive_cfg]}
                    onValueChange={([value]) => updateConfig("advanced_params.adaptive_cfg", value)}
                    min={1}
                    max={30}
                    step={0.1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>CLIP Skip: {config.advanced_params.clip_skip}</Label>
                  <Slider
                    value={[config.advanced_params.clip_skip]}
                    onValueChange={([value]) => updateConfig("advanced_params.clip_skip", value)}
                    min={1}
                    max={12}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>ADM Scaler Positive: {config.advanced_params.adm_scaler_positive}</Label>
                  <Slider
                    value={[config.advanced_params.adm_scaler_positive]}
                    onValueChange={([value]) => updateConfig("advanced_params.adm_scaler_positive", value)}
                    min={0.1}
                    max={3}
                    step={0.01}
                  />
                </div>

                <div className="space-y-2">
                  <Label>ADM Scaler Negative: {config.advanced_params.adm_scaler_negative}</Label>
                  <Slider
                    value={[config.advanced_params.adm_scaler_negative]}
                    onValueChange={([value]) => updateConfig("advanced_params.adm_scaler_negative", value)}
                    min={0.1}
                    max={3}
                    step={0.01}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Canny Low Threshold: {config.advanced_params.canny_low_threshold}</Label>
                  <Slider
                    value={[config.advanced_params.canny_low_threshold]}
                    onValueChange={([value]) => updateConfig("advanced_params.canny_low_threshold", value)}
                    min={1}
                    max={255}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Canny High Threshold: {config.advanced_params.canny_high_threshold}</Label>
                  <Slider
                    value={[config.advanced_params.canny_high_threshold]}
                    onValueChange={([value]) => updateConfig("advanced_params.canny_high_threshold", value)}
                    min={1}
                    max={255}
                    step={1}
                  />
                </div>
              </div>

              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent">
                    {advancedOpen ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                    {advancedOpen ? "Hide" : "Show"} More Advanced Options
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sampler</Label>
                      <Select
                        value={config.advanced_params.sampler_name}
                        onValueChange={(value) => updateConfig("advanced_params.sampler_name", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dpmpp_2m_sde_gpu">DPM++ 2M SDE GPU</SelectItem>
                          <SelectItem value="dpmpp_2m">DPM++ 2M</SelectItem>
                          <SelectItem value="dpmpp_sde">DPM++ SDE</SelectItem>
                          <SelectItem value="euler">Euler</SelectItem>
                          <SelectItem value="euler_ancestral">Euler Ancestral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Scheduler</Label>
                      <Select
                        value={config.advanced_params.scheduler_name}
                        onValueChange={(value) => updateConfig("advanced_params.scheduler_name", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="karras">Karras</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="simple">Simple</SelectItem>
                          <SelectItem value="ddim_uniform">DDIM Uniform</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={config.advanced_params.freeu_enabled}
                        onCheckedChange={(checked) => updateConfig("advanced_params.freeu_enabled", checked)}
                      />
                      <Label>Enable FreeU</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={config.advanced_params.black_out_nsfw}
                        onCheckedChange={(checked) => updateConfig("advanced_params.black_out_nsfw", checked)}
                      />
                      <Label>Black out NSFW</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={config.advanced_params.disable_preview}
                        onCheckedChange={(checked) => updateConfig("advanced_params.disable_preview", checked)}
                      />
                      <Label>Disable Preview</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={config.advanced_params.disable_seed_increment}
                        onCheckedChange={(checked) => updateConfig("advanced_params.disable_seed_increment", checked)}
                      />
                      <Label>Disable Seed Increment</Label>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="output" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Output Settings</CardTitle>
              <CardDescription>Configure how images are saved and processed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Save Extension</Label>
                  <Select
                    value={config.save_extension}
                    onValueChange={(value) => updateConfig("save_extension", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpg">JPG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Meta Scheme</Label>
                  <Select value={config.meta_scheme} onValueChange={(value) => updateConfig("meta_scheme", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fooocus">Fooocus</SelectItem>
                      <SelectItem value="a1111">A1111</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="save_name">Save Name (optional)</Label>
                <Input
                  id="save_name"
                  value={config.save_name}
                  onChange={(e) => updateConfig("save_name", e.target.value)}
                  placeholder="Custom filename prefix"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook_url">Webhook URL (optional)</Label>
                <Input
                  id="webhook_url"
                  value={config.webhook_url}
                  onChange={(e) => updateConfig("webhook_url", e.target.value)}
                  placeholder="https://your-webhook-url.com"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={config.save_meta}
                    onCheckedChange={(checked) => updateConfig("save_meta", checked)}
                  />
                  <Label>Save Metadata</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={config.require_base64}
                    onCheckedChange={(checked) => updateConfig("require_base64", checked)}
                  />
                  <Label>Require Base64</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={config.async_process}
                    onCheckedChange={(checked) => updateConfig("async_process", checked)}
                  />
                  <Label>Async Process</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={config.read_wildcards_in_order}
                    onCheckedChange={(checked) => updateConfig("read_wildcards_in_order", checked)}
                  />
                  <Label>Read Wildcards in Order</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="input" className="space-y-6">
          <Card>
            <div className="flex items-center justify-between">
              <CardHeader>
                <CardTitle>Input Images</CardTitle>
                <CardDescription>Configure input images and masks</CardDescription>
              </CardHeader>
              <div onClick={() => setopenInputimages(!openInputimages)} className="mr-4">
                {openInputimages ? <FaAngleUp size={25}/> : <FaAngleDown size={25}/>}
              </div>
            </div>
            {openInputimages === true && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="input_image">Input Image</Label>
                  <Input
                    id="input_image"
                    value={config.input_image}
                    onChange={(e) => updateConfig("input_image", e.target.value)}
                    placeholder="Base64 string or file path"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="input_mask">Input Mask</Label>
                  <Input
                    id="input_mask"
                    value={config.input_mask}
                    onChange={(e) => updateConfig("input_mask", e.target.value)}
                    placeholder="Base64 string or file path"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inpaint_prompt">Inpaint Additional Prompt</Label>
                  <Textarea
                    id="inpaint_prompt"
                    value={config.inpaint_additional_prompt}
                    onChange={(e) => updateConfig("inpaint_additional_prompt", e.target.value)}
                    placeholder="Additional prompt for inpainting"
                  />
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="outpaint_left">Outpaint Left</Label>
                    <Input
                      id="outpaint_left"
                      type="number"
                      value={config.outpaint_distance_left}
                      onChange={(e) => updateConfig("outpaint_distance_left", Number.parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outpaint_right">Outpaint Right</Label>
                    <Input
                      id="outpaint_right"
                      type="number"
                      value={config.outpaint_distance_right}
                      onChange={(e) => updateConfig("outpaint_distance_right", Number.parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outpaint_top">Outpaint Top</Label>
                    <Input
                      id="outpaint_top"
                      type="number"
                      value={config.outpaint_distance_top}
                      onChange={(e) => updateConfig("outpaint_distance_top", Number.parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="outpaint_bottom">Outpaint Bottom</Label>
                    <Input
                      id="outpaint_bottom"
                      type="number"
                      value={config.outpaint_distance_bottom}
                      onChange={(e) => updateConfig("outpaint_distance_bottom", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Image Prompts</CardTitle>
              <CardDescription>Configure ControlNet image prompts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.image_prompts.map((prompt, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Image Prompt {index + 1}</Label>
                    {config.image_prompts.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => removeImagePrompt(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Image</Label>
                      {/* <Input
                        value={prompt.cn_img}
                        onChange={(e) => updateImagePrompt(index, "cn_img", e.target.value)}
                        placeholder="Base64 string or file path"
                      /> */}
                      <Input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, index)} />

                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={prompt.cn_type}
                          onValueChange={(value) => updateImagePrompt(index, "cn_type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ImagePrompt">Image Prompt</SelectItem>
                            <SelectItem value="FaceSwap">Face Swap</SelectItem>
                            <SelectItem value="PyraCanny">Pyra Canny</SelectItem>
                            <SelectItem value="CPDS">CPDS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Stop: {prompt.cn_stop}</Label>
                        <Slider
                          value={[prompt.cn_stop]}
                          onValueChange={([value]) => updateImagePrompt(index, "cn_stop", value)}
                          min={0}
                          max={1}
                          step={0.01}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Weight: {prompt.cn_weight}</Label>
                        <Slider
                          value={[prompt.cn_weight]}
                          onValueChange={([value]) => updateImagePrompt(index, "cn_weight", value)}
                          min={0}
                          max={2}
                          step={0.01}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Button onClick={addImagePrompt} variant="outline" className="w-full bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Image Prompt
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-4 pt-6">
        <Button variant="outline" onClick={() => setConfig(defaultConfig)}>
          Reset to Default
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Images"
          )}
        </Button>
      </div>
      <ImageResults />
      <GenerationHistory />
    </div>
  )
}
