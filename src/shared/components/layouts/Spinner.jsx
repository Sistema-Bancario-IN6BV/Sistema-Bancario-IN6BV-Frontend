
export const Spinner = () => {
  return (
    <div className="w-full h-screen bg-bg-dark flex items-center justify-center relative overflow-hidden">
        <div className="absolute w-[30%] h-[30%] bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent shadow-[0_0_15px_rgba(245,200,66,0.3)] relative z-10">
        </div>
    </div>
  )
}
