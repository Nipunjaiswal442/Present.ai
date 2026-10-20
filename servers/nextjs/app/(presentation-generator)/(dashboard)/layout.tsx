import React from 'react'
import DashboardSidebar from './Components/DashboardSidebar'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='pai-canvas flex min-h-dvh pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0 md:pr-3'>
            <DashboardSidebar />
            <div className='w-full min-w-0'>
                {children}
            </div>
        </div>
    )
}

export default layout
