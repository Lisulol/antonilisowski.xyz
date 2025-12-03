interface WindowProps {
  children: React.ReactNode

  setOpen: (open: boolean) => void
}

export default function Window({ children, setOpen }: WindowProps) {
  return (
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
            <p
              onClick={() => setOpen(false)}
              className="text-sm inline-block px-2 py-0.5 rounded group-hover:bg-[#ff4f4f] group-hover:text-white"
            >
              X
            </p>
          </div>
        </div>
      </div>
      <div className="w-full flex h-full">{children}</div>
    </div>
  )
}
