"use client"
import { DndContext, useDraggable } from "@dnd-kit/core"
import { useState, useRef, useEffect } from "react"
import { Computer, DoorOpen, Square } from "lucide-react"
import Window from "@/components/window"

export default function HomePage() {
  const [openAbout, setOpenAbout] = useState(false)
  const [openGithub, setOpenGithub] = useState(false)
  const [openProjects, setOpenProjects] = useState(false)
  const clickCountRef = useRef<Record<string, number>>({})
  const clickTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({})
  const dragDistanceRef = useRef<Record<string, number>>({})
  const [openTech, setOpenTech] = useState(false)
  const items = [
    { id: "about", label: "About", icon: "/folder.png", x: 40, y: 60 },
    { id: "github", label: "Github", icon: "/folder.png", x: 120, y: 60 },
    {
      id: "Recycle Bin",
      label: "Recycle Bin",
      icon: "/recycle-bin.png",
      x: 360,
      y: 70,
    },
  ]
  const [time, setTime] = useState<Date>(new Date())

  const [positions, setPositions] = useState(() => {
    const map: Record<string, { x: number; y: number }> = {}
    items.forEach((it) => (map[it.id] = { x: it.x, y: it.y }))
    return map
  })
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const nodeRefMap = useRef<Record<string, HTMLElement | null>>({})

  function handleTimeUpdate() {
    setTime(new Date())
  }

  useEffect(() => {
    const interval = setInterval(handleTimeUpdate, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  function handleDoubleClick(itemId: string) {
    return () => {
      const dragDistance = dragDistanceRef.current[itemId] || 0
      console.log("Click on", itemId, "drag distance:", dragDistance)
      if (dragDistance > 5) return

      if (!clickCountRef.current[itemId]) {
        clickCountRef.current[itemId] = 0
      }

      clickCountRef.current[itemId]++
      console.log("Click count:", clickCountRef.current[itemId])

      if (clickTimeoutRef.current[itemId]) {
        clearTimeout(clickTimeoutRef.current[itemId])
      }

      if (clickCountRef.current[itemId] === 1) {
        clickTimeoutRef.current[itemId] = setTimeout(() => {
          clickCountRef.current[itemId] = 0
        }, 300)
      } else if (clickCountRef.current[itemId] === 2) {
        console.log("Double click detected on", itemId)
        clickCountRef.current[itemId] = 0
        clearTimeout(clickTimeoutRef.current[itemId])

        if (itemId === "about") {
          console.log("Opening about")
          setOpenAbout(true)
        } else if (itemId === "github") {
          console.log("Opening github")
          setOpenGithub(true)
        } else if (itemId === "projects") {
          console.log("Opening projects")
          setOpenProjects(true)
        } else if (itemId === "tech") {
          console.log("Opening tech")
          setOpenTech(true)
        }
      }
    }
  }

  function DraggableIcon({ item }: { item: (typeof items)[number] }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({ id: item.id })
    const pos = positions[item.id] || { x: 0, y: 0 }
    const startPosRef = useRef<{ x: number; y: number } | null>(null)

    const style: React.CSSProperties = {
      position: "absolute",
      left: pos.x,
      top: pos.y,
      transform: transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
      touchAction: "none",
      cursor: isDragging ? "grabbing" : "grab",
      zIndex: isDragging ? 50 : 10,
    }

    const setRefs = (node: HTMLElement | null) => {
      setNodeRef(node)
      nodeRefMap.current[item.id] = node
    }

    const handlePointerDown = (e: React.PointerEvent) => {
      startPosRef.current = { x: e.clientX, y: e.clientY }
      dragDistanceRef.current[item.id] = 0
      listeners?.onPointerDown?.(e as any)
    }

    const handlePointerMove = (e: React.PointerEvent) => {
      if (startPosRef.current) {
        const distance = Math.sqrt(
          Math.pow(e.clientX - startPosRef.current.x, 2) +
            Math.pow(e.clientY - startPosRef.current.y, 2)
        )
        dragDistanceRef.current[item.id] = distance
      }
      listeners?.onPointerMove?.(e as any)
    }

    const handlePointerUp = (e: React.PointerEvent) => {
      listeners?.onPointerUp?.(e as any)
    }

    return (
      <div
        ref={setRefs}
        {...attributes}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleDoubleClick(item.id)}
        style={style}
        className="w-10 h-10 rounded flex flex-col items-center justify-center p-1"
      >
        <img className="w-5 h-5" src={item.icon} alt={item.label} />
        <div className="flex items-center justify-center">
          <p className="text-xs text-white">{item.label}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex-col overflow-hidden w-full flex bg-[#00d9ff] items-center justify-center">
      <div className=" fixed top-3">
        <p className="text-2xl">Doors XP</p>
      </div>
      <div className="flex h-11/12 w-11/12 flex-col border-8 rounded-md border-[#0066ff]">
        <div className="w-full gap-2 flex-row bg-linear-to-b from-[#0105ff] via-[#019aff] to-[#00abfa] h-[4%] border-b-2 p-2 items-center justify-between flex border-[#00abfa]">
          <div className="flex items-center gap-2">
            <img className="w-5 h-5" src="/comp.png" alt="My Computer" />
            <p className="text-white italic">My Computer</p>
          </div>
          <div className="flex flex-row gap-5">
            <div className="w-8 h-8 flex items-center justify-center bg-linear-to-b from-[#016fff] to-[#00abfa] rounded-md hover:bg-[#797979] border border-[#ffffff] text-[#ffffff] group transition-colors duration-150">
              <p className="text-sm inline-block px-2 py-0.5 rounded group-hover:bg-[#474747] group-hover:text-white">
                -
              </p>
            </div>
            <div className="w-8 h-8 flex items-center justify-center bg-linear-to-b from-[#016fff] rounded-md to-[#00abfa] hover:bg-[#797979] border border-[#ffffff] group transition-colors duration-150">
              <div className="w-4 h-4 border-2 border-[#ffffff] bg-transparent group-hover:bg-[#474747] transition-colors duration-150">
                <div className="w-full h-[15%] bg-white"></div>
              </div>
            </div>
            <div className="w-8 h-8 flex items-center justify-center bg-linear-to-b from-[#ff2f2f] to-[#ff6464] hover:bg-[#797979] rounded-md border border-[#ffffff] text-[#ffffff] group transition-colors duration-150">
              <p className="text-sm inline-block px-2 py-0.5 rounded group-hover:bg-[#ff4f4f] group-hover:text-white">
                X
              </p>
            </div>
          </div>
        </div>
        <div
          className="h-full w-full flex flex-col justify-between"
          style={{
            backgroundImage: "url('/wallpaper.png')",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {mounted ? (
            <DndContext
              onDragEnd={(event) => {
                const { active, delta } = event
                if (!active) return
                setPositions((prev) => {
                  const cur = prev[active.id] || { x: 0, y: 0 }
                  const container = containerRef.current
                  const node = nodeRefMap.current[active.id]
                  const iconW = node?.offsetWidth ?? 40
                  const iconH = node?.offsetHeight ?? 40
                  if (!container) {
                    return {
                      ...prev,
                      [active.id]: { x: cur.x + delta.x, y: cur.y + delta.y },
                    }
                  }
                  const rect = container.getBoundingClientRect()

                  let nx = cur.x + delta.x
                  let ny = cur.y + delta.y

                  nx = Math.max(0, Math.min(nx, rect.width - iconW))
                  ny = Math.max(0, Math.min(ny, rect.height - iconH))
                  return { ...prev, [active.id]: { x: nx, y: ny } }
                })
              }}
            >
              <div className="relative h-full w-full">
                <div ref={containerRef} className="relative h-full w-full">
                  {items.map((it) => (
                    <DraggableIcon key={it.id} item={it} />
                  ))}
                </div>
                {openAbout && (
                  <div className="absolute inset-0 bg-white rounded-lg shadow-lg p-4 z-50 m-4 overflow-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-black font-bold">About</h2>
                      <button
                        onClick={() => setOpenAbout(false)}
                        className="text-black font-bold text-xl hover:bg-gray-200 px-2"
                      >
                        X
                      </button>
                    </div>
                    <div className="text-black">About content here</div>
                  </div>
                )}
                {openGithub && (
                  <div className="absolute inset-0 bg-white rounded-lg shadow-lg p-4 z-50 m-4 overflow-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-black font-bold">Github</h2>
                      <button
                        onClick={() => setOpenGithub(false)}
                        className="text-black font-bold text-xl hover:bg-gray-200 px-2"
                      >
                        X
                      </button>
                    </div>
                    <div className="text-black">Github content here</div>
                  </div>
                )}
              </div>
            </DndContext>
          ) : (
            <div className="relative h-full w-full">
              {items.map((it) => (
                <div
                  onClick={handleDoubleClick(it.id)}
                  key={it.id}
                  style={{ position: "absolute", left: it.x, top: it.y }}
                  className="w-10 h-10 rounded flex flex-col items-center justify-center p-1"
                >
                  <img className="w-5 h-5" src={it.icon} alt={it.label} />
                  <div className="flex items-center justify-center">
                    <p className="text-xs text-white">{it.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="w-full h-[4%] bg-linear-to-t from-[#0105ff] via-[#019aff] to-[#00abfa] flex items-center justify-between">
            <div className="w-full h-full">
              <div className="p-5  bg-linear-to-r border-r-2 border-t-2 border-green-500 rounded-r-3xl h-full flex items-center  w-[15%] from-[#01ff38] via-[#00e056] to-[#06a001]">
                <DoorOpen className="text-yellow-300" />
                <p className=" text-white italic">Start</p>
              </div>
            </div>
            <div className="bg-linear-to-r from-[#00eeff] border-l-2 border-t-2 border-cyan-600 via-[#00d9ff] to-[#00a2ff] p-2  h-full flex items-center justify-center w-[15%] text-black font-mono font-bold">
              {time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
