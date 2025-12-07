"use client"
import { DndContext, useDraggable } from "@dnd-kit/core"
import { useState, useRef, useEffect, use } from "react"
import type { MouseEvent } from "react"
import { DoorOpen, Power } from "lucide-react"
import Window from "@/components/Window/window"
import Link from "next/link"
import { GitHubCalendar } from "react-github-calendar"
import { Octokit } from "octokit"

export default function HomePage() {
  const [openAbout, setOpenAbout] = useState(false)
  const [openGithub, setOpenGithub] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)
  const clickCountRef = useRef<Record<string, number>>({})
  const clickTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({})
  const dragDistanceRef = useRef<Record<string, number>>({})
  const [openRecycle, setOpenRecycle] = useState(false)
  const [state2, setState2] = useState<"min" | "normal" | "max">("normal")
  const [ismax, setIsmax] = useState(false)
  const [repos, setRepos] = useState<any[]>([])
  const [state, setState] = useState<"min" | "normal" | "max">("normal")
  const [state1, setState1] = useState<"min" | "normal" | "max">("normal")
  const [state3, setState3] = useState<"min" | "normal" | "max">("normal")
  const [openProject, setOpenProject] = useState(false)
  const [languageCounts, setLanguageCounts] = useState<Record<string, number>>(
    {}
  )
  const octokit = new Octokit({
    auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
  })

  const items = [
    { id: "about", label: "About", icon: "/folder.png", x: 40, y: 60 },
    { id: "github", label: "Github", icon: "/folder.png", x: 120, y: 60 },
    {
      id: "recycle",
      label: "Recycle Bin",
      icon: "/recycle-bin.png",
      x: 360,
      y: 70,
    },
    {
      id: "projects",
      label: "Projects",
      icon: "/folder.png",
      x: 200,
      y: 60,
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
    fetchGithubData()

    return () => clearInterval(interval)
  }, [])

  async function fetchGithubData() {
    const resrep = await octokit.request("GET /users/{username}/repos", {
      username: "Lisulol",
      owner: "octokit",
    })

    const datarep = resrep.data
    console.log(datarep)
    setRepos(datarep)
    handlepercentage()
  }
  useEffect(() => {
    handlepercentage()
  }, [repos])
  async function handlepercentage() {
    if (!Array.isArray(repos) || repos.length === 0) return

    const totalBytes: Record<string, number> = {}

    for (const repo of repos) {
      const res = await octokit.request(`GET ${repo.languages_url}`)
      const languages = res.data
      for (const [lang, bytes] of Object.entries(languages)) {
        totalBytes[lang] = (totalBytes[lang] || 0) + (bytes as number)
      }
    }

    const total = Object.values(totalBytes).reduce(
      (sum, bytes) => sum + bytes,
      0
    )

    const percentages: Record<string, number> = {}
    for (const [lang, bytes] of Object.entries(totalBytes)) {
      percentages[lang] = (bytes / total) * 100
    }

    setLanguageCounts(percentages)
    console.log("Language percentages:", percentages)
  }
  function handleDoubleClick(app: string) {
    return (e: MouseEvent) => {
      e.stopPropagation()
      console.log("Double click detected on", app)

      if (app === "about") {
        console.log("Opening about")
        setOpenAbout(true)
        setOpenMenu(false)
      } else if (app === "github") {
        console.log("Opening github")
        setOpenGithub(true)
        setOpenMenu(false)
      } else if (app === "recycle") {
        console.log("Opening recycle bin")
        setOpenRecycle(true)
        setOpenMenu(false)
      } else if (app === "projects") {
        console.log("Opening projects")
        setOpenProject(true)
        setOpenMenu(false)
      }
    }
  }

  function DraggableIcon({ app }: { app: (typeof items)[number] }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({ id: app.id })
    const pos = positions[app.id] || { x: 0, y: 0 }
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
      nodeRefMap.current[app.id] = node
    }

    function handlePointerDown(e: React.PointerEvent) {
      startPosRef.current = { x: e.clientX, y: e.clientY }
      dragDistanceRef.current[app.id] = 0
      listeners?.onPointerDown?.(e as any)
    }

    function handlePointerMove(e: React.PointerEvent) {
      if (startPosRef.current) {
        const distance = Math.sqrt(
          Math.pow(e.clientX - startPosRef.current.x, 2) +
            Math.pow(e.clientY - startPosRef.current.y, 2)
        )
        dragDistanceRef.current[app.id] = distance
      }
      listeners?.onPointerMove?.(e as any)
    }

    function handlePointerUp(e: React.PointerEvent) {
      listeners?.onPointerUp?.(e as any)

      const distance = dragDistanceRef.current[app.id] ?? 0
      const CLICK_THRESHOLD = 6
      if (distance <= CLICK_THRESHOLD) {
        const prev = clickCountRef.current[app.id] || 0
        const next = prev + 1
        clickCountRef.current[app.id] = next

        if (clickTimeoutRef.current[app.id]) {
          clearTimeout(clickTimeoutRef.current[app.id])
        }

        if (next >= 2) {
          clickCountRef.current[app.id] = 0
          handleDoubleClick(app.id)(e as any)
        } else {
          clickTimeoutRef.current[app.id] = setTimeout(() => {
            clickCountRef.current[app.id] = 0
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
        onDoubleClick={handleDoubleClick(app.id)}
        style={style}
        className="w-10 h-10 rounded flex flex-col items-center justify-center p-1"
      >
        <img className="w-5 h-5" src={app.icon} alt={app.label} />
        <div className="flex items-center justify-center">
          <p className="text-xs text-white">{app.label}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex-col w-full flex bg-[#00d9ff] items-center justify-center">
      <div className=" fixed top-3">
        <p
          style={{
            display: ismax ? "none" : "block",
          }}
          className="text-2xl"
        >
          Doors XP
        </p>
      </div>
      <div
        style={{
          height: ismax ? "100%" : "90%",
          width: ismax ? "100%" : "90%",
        }}
        className="flex flex-col border-8 rounded-md border-[#0066ff]"
      >
        <div className="w-full gap-2 flex-row bg-linear-to-b from-[#0105ff] via-[#019aff] to-[#00abfa] h-[4%] border-b-2 p-2 items-center justify-between flex border-[#00abfa]">
          <div className="flex items-center gap-2">
            <img className="w-5 h-5" src="/comp.png" alt="My Computer" />
            <p className="text-white italic">Computer</p>
          </div>
          <div className="flex flex-row gap-5">
            <div className="w-8 h-8 flex items-center justify-center bg-linear-to-b from-[#016fff] to-[#00abfa] rounded-md hover:bg-[#797979] border border-[#ffffff] text-[#ffffff] group transition-colors duration-150">
              <p className="text-sm inline-block px-2 py-0.5 rounded group-hover:bg-[#474747] group-hover:text-white">
                -
              </p>
            </div>
            <div
              onClick={() => {
                setIsmax(!ismax)
              }}
              className="w-8 h-8 flex items-center justify-center bg-linear-to-b from-[#016fff] rounded-md to-[#00abfa] hover:bg-[#797979] border border-[#ffffff] group transition-colors duration-150"
            >
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
                    <DraggableIcon key={it.id} app={it} />
                  ))}
                </div>
                {openRecycle && state2 !== "min" && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg z-200 overflow-auto">
                    <Window
                      windowid={"Recycle Bin"}
                      src="/recycle-bin.png"
                      state={state2}
                      setState={setState2}
                      setOpen={setOpenRecycle}
                    >
                      <div className="text-black italic h-full w-full p-5 bg-[#eeeded]">
                        <p>
                          Here you should put this site, becouse it so trash
                        </p>
                      </div>
                    </Window>
                  </div>
                )}
                {openAbout && state1 !== "min" && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg z-200 overflow-auto">
                    <Window
                      src="/folder.png "
                      windowid={"About"}
                      state={state1}
                      setState={setState1}
                      setOpen={setOpenAbout}
                    >
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
                          projects as well as Tailwind for my CSS.
                        </p>
                      </div>
                    </Window>
                  </div>
                )}
                {openGithub && state !== "min" && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg shadow-lg z-200 overflow-auto">
                    <Window
                      windowid={"Github"}
                      src="/folder.png"
                      state={state}
                      setState={setState}
                      setOpen={setOpenGithub}
                    >
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
                        <div className="mt-6 w-1/6">
                          <h2 className="text font-bold mb-3">
                            Languages I Use:
                          </h2>
                          {Object.entries(languageCounts).map(
                            ([key, percent]) => (
                              <div key={key} className="mb-3 text-xs">
                                <div className="flex justify-between mb-1">
                                  <span className="font-bold">{key}</span>
                                  <span>{percent.toFixed(0)}%</span>
                                </div>
                                <div className="w-full rounded-full h-1 overflow-hidden">
                                  <div
                                    className="bg-[#8f8f8f] h-full rounded-full transition-all duration-500"
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </Window>
                  </div>
                )}
                {openProject && state3 !== "min" && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg shadow-lg z-200 overflow-hidden">
                    <Window
                      windowid={"Projects"}
                      src="/folder.png"
                      state={state3}
                      setState={setState3}
                      setOpen={setOpenProject}
                    >
                      <div
                        style={{
                          height: state3 === "max" ? "100%" : "500px",
                        }}
                        className="text-black italic  w-full p-5 bg-[#eeeded] overflow-auto"
                      >
                        <p className="text-2xl  font-bold mb-4">Projects</p>
                        <p>Here are some of my projects</p>

                        {Array.isArray(repos) &&
                          repos
                            .filter(
                              (repo) =>
                                repo.id !== 1074192965 &&
                                repo.id !== 1074186020 &&
                                repo.id !== 1102549073
                            )
                            .map((repo) => (
                              <div
                                key={repo.id}
                                className="border flex justify-between p-5 mb-2"
                              >
                                <div className="flex">
                                  <a
                                    href={repo.html_url}
                                    target="_blank"
                                    className="text-[#0151ff] hover:underline"
                                  >
                                    {repo.name}
                                  </a>
                                  <p>: {repo.description}</p>
                                </div>
                                <p className="gap-5 flex">
                                  <span className="flex ">
                                    Main Language :
                                    <span className="text-amber-400">
                                      {repo.language}
                                    </span>
                                  </span>
                                  <span className="flex">
                                    Last Updated :{" "}
                                    <span className="text-gray-600">
                                      {repo.updated_at.split("T")[0]}
                                    </span>
                                  </span>
                                </p>
                              </div>
                            ))}
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
                        <div className="w-full rounded-tr-lg h-2/12 bg-linear-to-b from-[#0105ff] via-[#019aff] to-[#00abfa]">
                          <div className="h-full w-full flex gap-5 items-center p-1">
                            <img src="/ico.png" className="w-[10%]" />
                            <p className="italic text-3xl text-white">You</p>
                          </div>
                        </div>
                        <div className="flex h-full w-full border-t border-amber-400 ">
                          <div className="w-1/2 h-full bg-[#ffffff] border-r-2 border-[#000d58] p-10 flex flex-col gap-15">
                            <Link href="https://support.microsoft.com/en-us/windows/internet-explorer-downloads-d49e1f0d-571c-9a7b-d97e-be248806ca70">
                              <div className="text-xs  w-full hover:underline flex relative h-5 items-center  ">
                                <img src="ie.png" className="w-5 h-5 "></img>
                                <p>Internet Explorer("just for fun")</p>
                              </div>
                            </Link>
                            <Link
                              href={"mailto:antek@antonilisowski.xyz"}
                              className="text-xs hover:underline flex  h-5 items-center "
                            >
                              <img src="mail.png" className="w-5 h-5 "></img>
                              <p>Contact Me</p>
                            </Link>
                          </div>
                          <div className="w-1/2 h-full  p-10 bg-[#85c7fd] flex flex-col items-start gap-10">
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
                              className="italics  hover:underline flex w-5 h-5  items-center justify-center"
                            >
                              <img
                                src="/folder.png"
                                className="w-8 inline-block mr-2"
                              />
                              <p>Github</p>
                            </div>
                            <div
                              onClick={handleDoubleClick("projects")}
                              className="italics hover:underline w-5 h-5 flex  items-center justify-center"
                            >
                              <img
                                src="/folder.png"
                                className="w-8 inline-block mr-2"
                              />
                              <p>Projects</p>
                            </div>
                            <div
                              onClick={handleDoubleClick("recycle")}
                              className="italics hover:underline w-5 h-5 flex  items-center justify-center"
                            >
                              <img
                                src="/recycle-bin.png"
                                className="w-8 inline-block mr-2"
                              />
                              <p>Recycle BIn</p>
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
            <div className="flex w-full h-full">
              <div className="w-[25%] h-full">
                <button
                  onClick={() => {
                    setOpenMenu(!openMenu)
                  }}
                  className="p-5 bg-linear-to-r hover:bg-none border-r-2 border-t-2 hover:bg-green-500 border-green-500 rounded-r-3xl h-full flex items-center  w-full from-[#01ff38] via-[#00e056] to-[#06a001]"
                >
                  <DoorOpen className="text-yellow-300" />

                  <p className="text-white text-2xl italic ">Start</p>
                </button>
              </div>
              <div className="flex h-full items-center z-9999 ml-5 gap-1">
                {openAbout && (
                  <div
                    style={{
                      backgroundColor:
                        state1 === "min" ? "#498af2" : "transparent",
                    }}
                    onClick={() => {
                      handleDoubleClick("about")
                      setState1("normal")
                    }}
                    className="relative group text-white w-10 italic rounded flex flex-col items-center justify-center p-1 cursor-pointer hover:bg-[#0180ff] transition-colors"
                  >
                    <img src="/folder.png" className="w-5 h-5" />
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#ffffcc] text-black text-xs px-2 py-1 rounded border border-black whitespace-nowrap">
                      About
                    </div>
                  </div>
                )}
                {openGithub && (
                  <div
                    style={{
                      backgroundColor:
                        state === "min" ? "#498af2" : "transparent",
                    }}
                    onClick={() => {
                      handleDoubleClick("github")
                      setState("normal")
                    }}
                    className="relative group text-white w-10 italic rounded flex flex-col items-center justify-center p-1 cursor-pointer hover:bg-[#0180ff] transition-colors"
                  >
                    <img src="/folder.png" className="w-5 h-5" />
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#ffffcc] text-black text-xs px-2 py-1 rounded border border-black whitespace-nowrap">
                      Github
                    </div>
                  </div>
                )}
                {openRecycle && (
                  <div
                    style={{
                      backgroundColor:
                        state2 === "min" ? "#498af2" : "transparent",
                    }}
                    onClick={() => {
                      handleDoubleClick("recycle")
                      setState2("normal")
                    }}
                    className="relative group text-white w-10 italic rounded flex flex-col items-center justify-center p-1 cursor-pointer hover:bg-[#0180ff] transition-colors"
                  >
                    <img src="/recycle-bin.png" className="w-5 h-5" />
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#ffffcc] text-black text-xs px-2 py-1 rounded border border-black whitespace-nowrap">
                      Recycle Bin
                    </div>
                  </div>
                )}
                {openProject && (
                  <div
                    style={{
                      backgroundColor:
                        state2 === "min" ? "#498af2" : "transparent",
                    }}
                    onClick={() => {
                      handleDoubleClick("projects")
                      setState3("normal")
                    }}
                    className="relative group text-white w-10 italic rounded flex flex-col items-center justify-center p-1 cursor-pointer hover:bg-[#0180ff] transition-colors"
                  >
                    <img src="/folder.png" className="w-5 h-5" />
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-[#ffffcc] text-black text-xs px-2 py-1 rounded border border-black whitespace-nowrap">
                      Projects
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-linear-to-r from-[#00eeff] border-l-2 border-t-2 border-cyan-600 via-[#00d9ff] to-[#00a2ff] p-2  h-full flex items-center justify-center w-[15%] text-black font-mono font-bold">
              <p className="italic">
                {time.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
