"use client"

export default function imageLoader({ src, width, quality }: { src: string; width: number; quality: number }) {
   return `${process.env.NEXT_PUBLIC_BACKEND_URL}/file/image/${src}`
}
