"use client"
import { DndContext, useDraggable } from "@dnd-kit/core"
import { useState, useRef, useEffect } from "react"
import type { MouseEvent } from "react"
import { DoorOpen, Power } from "lucide-react"
import Window from "@/components/Window/window"
import Link from "next/link"
import { GitHubCalendar } from "react-github-calendar"

export default function HomePage() {
  const [openAbout, setOpenAbout] = useState(false)
  const [openGithub, setOpenGithub] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)
  const clickCountRef = useRef<Record<string, number>>({})
  const clickTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({})
  const dragDistanceRef = useRef<Record<string, number>>({})

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
    return (e: MouseEvent) => {
      e.stopPropagation()
      console.log("Double click detected on", itemId)

      if (itemId === "about") {
        console.log("Opening about")
        setOpenAbout(true)
        setOpenMenu(false)
      } else if (itemId === "github") {
        console.log("Opening github")
        setOpenGithub(true)
        setOpenMenu(false)
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

      const distance = dragDistanceRef.current[item.id] ?? 0
      const CLICK_THRESHOLD = 6
      if (distance <= CLICK_THRESHOLD) {
        const prev = clickCountRef.current[item.id] || 0
        const next = prev + 1
        clickCountRef.current[item.id] = next

        if (clickTimeoutRef.current[item.id]) {
          clearTimeout(clickTimeoutRef.current[item.id])
        }

        if (next >= 2) {
          clickCountRef.current[item.id] = 0
          handleDoubleClick(item.id)(e as any)
        } else {
          clickTimeoutRef.current[item.id] = setTimeout(() => {
            clickCountRef.current[item.id] = 0
          }, 300)
        }
      }
    }

    return (
      <div
        ref={setRefs}
        {...attributes}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick(item.id)}
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
    <div className="h-screen flex-col w-full flex bg-[#00d9ff] items-center justify-center">
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
              <Link href={"/gtfo"} className="w-full h-full">
                <p className="text-sm w-full h-full flex items-center justify-center  px-2 py-0.5 rounded group-hover:bg-[#ce0606] group-hover:text-white">
                  X
                </p>
              </Link>
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
                  <div className="w-full h-full flex items-center justify-center rounded-lg z-50  overflow-auto">
                    <Window windowid={"About"} setOpen={setOpenAbout}>
                      <div className="text-black italic h-full w-full p-5 bg-[#eeeded]">
                        <h1 className="text-2xl  font-bold mb-4">About</h1>
                        <p>
                          Welcome to my site, your probably asking yourself:
                          "what the fuck" and i can quickly answer it. I have no
                          fucking idea, doing this to kill time and also I dont
                          like that my domain is empty. So here we are, a shit
                          website about me. And if you want to learn something
                          about me, well you wont. I just do my thing. Might
                          delete later.
                        </p>
                        <div className="w-full h-0.5 rounded-full mt-2 mb-2 bg-[#969696]" />
                        <p>
                          I mainly write in TypeScript and use Next.js for my
                          projects as well as Tailwind for my frontend.
                        </p>
                      </div>
                    </Window>
                  </div>
                )}
                {openGithub && (
                  <div className=" flex items-center justify-center rounded-lg shadow-lg z-100  overflow-auto">
                    <Window windowid={"Github"} setOpen={setOpenGithub}>
                      <div className="text-black italic h-full w-full p-5 bg-[#eeeded]">
                        <h1 className="text-2xl  font-bold mb-4">Github</h1>
                        <p>
                          So yeah it's not like Im a good programmer, matter of
                          fact i'm not. But anyway if u still want to look at my
                          github here it is: {""}
                          <a
                            className="text-[#0151ff] hover:underline"
                            href="https://github.com/Lisulol"
                            target="_blank"
                          >
                            github
                          </a>
                          <br />
                          Here are my contributions throughout the year:
                        </p>

                        <GitHubCalendar username="Lisulol" />
                        <p>
                          Here are my projects that im most proud of:
                          <br />
                          <br />
                          <br />
                          <br />
                          ...actually none
                        </p>
                      </div>
                    </Window>
                  </div>
                )}
                {openMenu && (
                  <div
                    className="pointer-events-none absolute inset-0 flex items-end justify-start z-120"
                    onClick={() => setOpenMenu(false)}
                  >
                    <div className="pointer-events-auto flex h-3/5 w-2/5 bg-[#eeeded] border-2 border-[#000d58] rounded-tr-xl shadow-2xl">
                      <div className="w-full h-full flex rounded-tr-xl flex-col justify-between">
                        <div className="w-full h-2/12 bg-linear-to-b from-[#0105ff] via-[#019aff] to-[#00abfa]">
                          <div className="h-full w-full flex gap-5 items-center p-1">
                            <img src="/ico.png" className="w-[20%]" />
                            <p className="italic text-3xl text-white">You</p>
                          </div>
                        </div>
                        <div className="flex h-full w-full">
                          <div className="w-1/2 h-full border-r-2 border-[#000d58] p-10 flex flex-col gap-15">
                            <Link href="https://support.microsoft.com/en-us/windows/internet-explorer-downloads-d49e1f0d-571c-9a7b-d97e-be248806ca70">
                              <div className="text-xs  w-full hover:underline flex relative right-3 h-5 items-center justify-center ">
                                <img src="ie.png" className="w-5 h-5 "></img>
                                <p>Internet Explorer("just for fun")</p>
                              </div>
                            </Link>
                            <Link
                              href={"mailto:antek@antonilisowski.xyz"}
                              className="text-xs hover:underline flex w-5 h-5 items-center justify-center flex-col"
                            >
                              <img src="mail.png" className="w-5 h-5 "></img>
                              <p>Contact Me</p>
                            </Link>
                          </div>
                          <div className="w-1/2 h-full  p-10 bg-[#85c7fd] flex flex-col border gap-10">
                            <div
                              onClick={handleDoubleClick("about")}
                              className="italics hover:underline w-5 h-5 flex  items-center justify-center"
                            >
                              <img
                                src="/folder.png"
                                className="w-8 inline-block mr-2"
                              />
                              <p>About</p>
                            </div>
                            <div
                              onClick={handleDoubleClick("github")}
                              className="italics  hover:underlin flex w-5 h-5  items-center justify-center"
                            >
                              <img
                                src="/folder.png"
                                className="w-8 inline-block mr-2"
                              />
                              <p>Github</p>
                            </div>
                          </div>
                        </div>
                        <div className="w-full pr-5 flex items-center justify-end gap-5 h-[13%] bg-linear-to-t from-[#0105ff] via-[#019aff] to-[#00abfa]">
                          <div className="h-full flex items-center justify-center">
                            <Link
                              href="/gtfo"
                              className=" text-white bg-red-500 border-white border rounded-xl p-2 flex items-center justify-center ml-5 mt-2 hover:bg-red-600"
                            >
                              <Power />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DndContext>
          ) : (
            <div className="relative h-full w-full">
              {items.map((it) => (
                <div
                  onDoubleClick={handleDoubleClick(it.id)}
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
              <button
                onClick={() => {
                  setOpenMenu(!openMenu)
                }}
                className="p-5  bg-linear-to-r hover:bg-none border-r-2 border-t-2 hover:bg-green-500 border-green-500 rounded-r-3xl h-full flex items-center  w-[15%] from-[#01ff38] via-[#00e056] to-[#06a001]"
              >
                <DoorOpen className="text-yellow-300" />

                <p className="text-white text-2xl italic ">Start</p>
              </button>
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
