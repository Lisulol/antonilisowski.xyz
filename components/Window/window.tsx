"use client"
import { useState } from "react"

interface WindowProps {
  children: React.ReactNode
  windowid?: string
  setOpen: (open: boolean) => void
}

export default function Window({ children, setOpen, windowid }: WindowProps) {
  const [isMaximized, setIsMaximized] = useState(false)
  const [langs, setLangs] = useState<any | null>(null)
  const [langsLoading, setLangsLoading] = useState(false)
  const [langsError, setLangsError] = useState<string | null>(null)

  function handleResize() {
    if (isMaximized) {
      setIsMaximized(false)
    } else {
      setIsMaximized(true)
    }
  }

  return (
    <div
      style={{
        width: isMaximized ? "100%" : "90%",
        height: isMaximized ? "100%" : "",
        top: isMaximized ? "0" : "25%",
        left: isMaximized ? "0" : "5%",
        position: "absolute",
        transition:
          "top 260ms ease, left 260ms ease, width 260ms ease, height 260ms ease, border-radius 200ms ease",
      }}
      className="flex flex-col border-8 rounded-md border-[#0066ff]"
    >
      <div className="w-full gap-2 flex-row bg-linear-to-b from-[#0105ff] via-[#019aff] to-[#00abfa] h-[4%] border-b-2 p-2 items-center justify-between flex border-[#00abfa]">
        <div className="flex items-center gap-2">
          <img className="w-5 h-5" src="/comp.png" alt="My Computer" />
          <p className="text-white italic">{windowid}</p>
        </div>
        <div className="flex flex-row gap-5">
          <div className="w-8 h-8 flex items-center justify-center bg-linear-to-b from-[#016fff] to-[#00abfa] rounded-md hover:bg-[#797979] border border-[#ffffff] text-[#ffffff] group transition-colors duration-150">
            <p className="text-sm inline-block px-2 py-0.5 rounded group-hover:bg-[#474747] group-hover:text-white">
              -
            </p>
          </div>
          <div
            className="w-8 h-8 flex items-center justify-center bg-linear-to-b from-[#016fff] rounded-md to-[#00abfa] hover:bg-[#797979] border border-[#ffffff] group transition-colors duration-150"
            onClick={handleResize}
          >
            <div className="w-4 h-4 border-2 border-[#ffffff] bg-transparent group-hover:bg-[#474747] transition-colors duration-150">
              <div className="w-full h-[15%] bg-white"></div>
            </div>
          </div>

          <div className="w-8 h-8 flex items-center justify-center bg-linear-to-b from-[#ff2f2f] to-[#ff6464] hover:bg-[#797979] rounded-md border border-[#ffffff] text-[#ffffff] group transition-colors duration-150">
            <p
              onClick={() => setOpen(false)}
              className="text-sm  w-full h-full flex items-center justify-center  px-2 py-0.5 rounded group-hover:bg-[#ce0606] group-hover:text-white"
            >
              X
            </p>
          </div>
        </div>
      </div>
      <div className="w-full flex h-full">
        <div className="w-full h-full">{children}</div>
      </div>
    </div>
  )
}
