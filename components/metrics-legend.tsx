"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Calculator } from "lucide-react"

export default function MetricsLegend() {
  const metrics = [
    {
      name: "การเติบโตของรายได้ (Revenue Growth)",
      description: "เปอร์เซ็นต์การเปลี่ยนแปลงของรายได้ในช่วงเวลาหนึ่ง",
      weight: "20%",
      ranges: [
        {
          symbol: "🚀",
          level: "ยอดเยี่ยม",
          range: "> 20%",
          color: "text-emerald-600",
          desc: "การเติบโตสูงมาก (เทคโนโลยี, สตาร์ทอัพ)",
          score: "100 คะแนน",
        },
        {
          symbol: "📈",
          level: "ดี",
          range: "10-20%",
          color: "text-blue-600",
          desc: "การเติบโตที่ดีและยั่งยืน",
          score: "80 คะแนน",
        },
        {
          symbol: "⚡",
          level: "ปานกลาง",
          range: "5-10%",
          color: "text-yellow-600",
          desc: "บริษัทขนาดใหญ่ที่อิ่มตัว",
          score: "60 คะแนน",
        },
        {
          symbol: "⚠️",
          level: "น่ากังวล",
          range: "< 5%",
          color: "text-red-600",
          desc: "การเติบโตต่ำหรือติดลบ",
          score: "20 คะแนน",
        },
      ],
    },
    {
      name: "การเติบโตของกำไร (Profit Growth)",
      description: "เปอร์เซ็นต์การเปลี่ยนแปลงของกำไรสุทธิ",
      weight: "20%",
      ranges: [
        {
          symbol: "🚀",
          level: "ยอดเยี่ยม",
          range: "> 15%",
          color: "text-emerald-600",
          desc: "กำไรเติบโตสูงมาก",
          score: "100 คะแนน",
        },
        {
          symbol: "📈",
          level: "ดี",
          range: "5-15%",
          color: "text-blue-600",
          desc: "กำไรเติบโตดี",
          score: "80 คะแนน",
        },
        {
          symbol: "⚡",
          level: "ปานกลาง",
          range: "0-5%",
          color: "text-yellow-600",
          desc: "กำไรเติบโตเล็กน้อย",
          score: "60 คะแนน",
        },
        {
          symbol: "⚠️",
          level: "น่ากังวล",
          range: "< 0%",
          color: "text-red-600",
          desc: "กำไรลดลง",
          score: "20 คะแนน",
        },
      ],
    },
    {
      name: "EPS (Earnings Per Share)",
      description: "กำไรสุทธิของบริษัทหารด้วยจำนวนหุ้นที่หมุนเวียน",
      weight: "15%",
      ranges: [
        {
          symbol: "✅",
          level: "ดีมาก",
          range: "> $5",
          color: "text-emerald-600",
          desc: "กำไรต่อหุ้นสูง",
          score: "100 คะแนน",
        },
        {
          symbol: "📊",
          level: "ดี",
          range: "$2-5",
          color: "text-blue-600",
          desc: "กำไรต่อหุ้นดี",
          score: "80 คะแนน",
        },
        {
          symbol: "⚡",
          level: "ปานกลาง",
          range: "$0-2",
          color: "text-yellow-600",
          desc: "กำไรต่อหุ้นต่ำ",
          score: "60 คะแนน",
        },
        {
          symbol: "❌",
          level: "ขาดทุน",
          range: "< $0",
          color: "text-red-600",
          desc: "บริษัทขาดทุน",
          score: "0 คะแนน",
        },
      ],
    },
    {
      name: "PE Ratio (Price-to-Earnings)",
      description: "ราคาหุ้นต่อกำไรต่อหุ้น ใช้ประเมินความถูกแพงของหุ้น",
      weight: "20%",
      ranges: [
        {
          symbol: "💎",
          level: "ราคาถูก",
          range: "< 15",
          color: "text-blue-600",
          desc: "อาจถูกประเมินต่ำ",
          score: "90 คะแนน",
        },
        {
          symbol: "⚖️",
          level: "สมดุล",
          range: "15-25",
          color: "text-emerald-600",
          desc: "ราคาเหมาะสม",
          score: "80 คะแนน",
        },
        {
          symbol: "🔥",
          level: "ราคาสูง",
          range: "25-40",
          color: "text-orange-600",
          desc: "หุ้นเติบโต/แพง",
          score: "50 คะแนน",
        },
        {
          symbol: "⚠️",
          level: "แพงมาก",
          range: "> 40",
          color: "text-red-600",
          desc: "อาจประเมินสูงเกิน",
          score: "20 คะแนน",
        },
      ],
    },
    {
      name: "PS Ratio (Price-to-Sales)",
      description: "ราคาหุ้นต่อยอดขายต่อหุ้น เหมาะสำหรับบริษัทที่ยังไม่มีกำไร",
      weight: "15%",
      ranges: [
        {
          symbol: "💎",
          level: "ราคาถูก",
          range: "< 2",
          color: "text-blue-600",
          desc: "เทียบยอดขายถูก",
          score: "90 คะแนน",
        },
        {
          symbol: "⚖️",
          level: "สมดุล",
          range: "2-5",
          color: "text-emerald-600",
          desc: "ราคาเหมาะสม",
          score: "80 คะแนน",
        },
        {
          symbol: "🔥",
          level: "ราคาสูง",
          range: "5-10",
          color: "text-orange-600",
          desc: "หุ้นพรีเมี่ยม",
          score: "50 คะแนน",
        },
        {
          symbol: "⚠️",
          level: "แพงมาก",
          range: "> 10",
          color: "text-red-600",
          desc: "ราคาสูงมาก",
          score: "20 คะแนน",
        },
      ],
    },
    {
      name: "อัตราปันผล (Dividend Yield)",
      description: "เงินปันผลที่จ่ายต่อหุ้น เทียบกับราคาหุ้นปัจจุบัน",
      weight: "10%",
      ranges: [
        {
          symbol: "🏆",
          level: "สูง",
          range: "4-6%",
          color: "text-yellow-600",
          desc: "หุ้นปันผลดี",
          score: "85 คะแนน",
        },
        {
          symbol: "💰",
          level: "ปานกลาง",
          range: "2-4%",
          color: "text-emerald-600",
          desc: "ปันผลสมดุล",
          score: "75 คะแนน",
        },
        {
          symbol: "🌱",
          level: "ต่ำ",
          range: "0-2%",
          color: "text-blue-600",
          desc: "โฟกัสการเติบโต",
          score: "70 คะแนน",
        },
        {
          symbol: "⚠️",
          level: "สูงมาก",
          range: "> 6%",
          color: "text-red-600",
          desc: "ควรตรวจสอบความยั่งยืน",
          score: "40 คะแนน",
        },
      ],
    },
  ]

  return (
    <Card className="border-0 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/50 dark:to-gray-900/50 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Info className="h-5 w-5" />
          คู่มือการอ่านตัวชี้วัดทางการเงิน
        </CardTitle>
        <CardDescription>เข้าใจสัญลักษณ์และช่วงค่าของแต่ละตัวชี้วัดเพื่อการวิเคราะห์ที่ดีขึ้น</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Investment Score Calculation */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              การคำนวณคะแนนการลงทุน
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-2">น้ำหนักการประเมิน:</h5>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• การเติบโตรายได้: 20%</li>
                  <li>• การเติบโตกำไร: 20%</li>
                  <li>• ความคุ้มค่า (PE): 20%</li>
                  <li>• ความคุ้มค่า (PS): 15%</li>
                  <li>• กำไรต่อหุ้น (EPS): 15%</li>
                  <li>• อัตราปันผล: 10%</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">ระดับคำแนะนำ:</h5>
                <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                  <li>• 80-100%: แนะนำซื้อขอ</li>
                  <li>• 60-79%: พิจารณาซื้อ</li>
                  <li>• 40-59%: รอดูก่อน</li>
                  <li>• 0-39%: ไม่แนะนำ</li>
                </ul>
              </div>
            </div>
          </div>

          {metrics.map((metric, index) => (
            <div key={index} className="p-4 bg-white dark:bg-slate-800 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-lg">{metric.name}</h4>
                <Badge variant="outline" className="text-xs">
                  น้ำหนัก {metric.weight}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{metric.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {metric.ranges.map((range, rangeIndex) => (
                  <div
                    key={rangeIndex}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-700 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{range.symbol}</span>
                      <div>
                        <Badge variant="outline" className={`text-xs ${range.color}`}>
                          {range.level}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">{range.range}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground max-w-32">{range.desc}</div>
                      <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">{range.score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💡 ข้อควรพิจารณา</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• ควรเปรียบเทียบกับบริษัทในอุตสาหกรรมเดียวกัน</li>
            <li>• ดูแนวโน้มในอดีตของบริษัทนั้น ๆ</li>
            <li>• พิจารณาปัจจัยภายนอก เช่น สภาวะเศรษฐกิจ</li>
            <li>• ไม่ควรใช้ตัวชี้วัดเดียวในการตัดสินใจลงทุน</li>
            <li>• คะแนนการลงทุนเป็นเพียงแนวทาง ไม่ใช่คำแนะนำการลงทุนที่แน่นอน</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
