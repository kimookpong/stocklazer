"use client"

import { useState } from "react"
import { Share2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface ShareButtonProps {
  symbol: string
  companyName: string
}

export default function ShareButton({ symbol, companyName }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const shareUrl = `${window.location.origin}${window.location.pathname}?stock=${symbol}`
  const shareText = `ดูการวิเคราะห์หุ้น ${symbol} (${companyName}) - US Stock Analyzer`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast({
        title: "คัดลอกลิงก์แล้ว!",
        description: "ลิงก์ถูกคัดลอกไปยังคลิปบอร์ดแล้ว",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถคัดลอกลิงก์ได้",
        variant: "destructive",
      })
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: `ดูการวิเคราะห์หุ้น ${symbol} พร้อมข้อมูลทางการเงินและคำแนะนำการลงทุน`,
          url: shareUrl,
        })
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("Error sharing:", err)
        }
      }
    }
  }

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(shareText)

    let shareLink = ""

    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        break
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      case "line":
        shareLink = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`
        break
      default:
        return
    }

    window.open(shareLink, "_blank", "width=600,height=400")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Share2 className="h-4 w-4" />
          แชร์
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          {copied ? "คัดลอกแล้ว!" : "คัดลอกลิงก์"}
        </DropdownMenuItem>

        {navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare} className="gap-2">
            <Share2 className="h-4 w-4" />
            แชร์ (Native)
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={() => handleSocialShare("line")} className="gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">L</span>
          </div>
          แชร์ใน LINE
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleSocialShare("facebook")} className="gap-2">
          <div className="w-4 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">f</span>
          </div>
          แชร์ใน Facebook
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleSocialShare("twitter")} className="gap-2">
          <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">𝕏</span>
          </div>
          แชร์ใน X (Twitter)
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => handleSocialShare("linkedin")} className="gap-2">
          <div className="w-4 h-4 bg-blue-700 rounded-sm flex items-center justify-center">
            <span className="text-white text-xs font-bold">in</span>
          </div>
          แชร์ใน LinkedIn
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
