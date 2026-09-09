import React from 'react'
import DashboardSidebar from './Components/DashboardSidebar'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='pai-canvas flex min-h-dvh pr-3'>
            <DashboardSidebar />
            <div className='w-full min-w-0'>
                {children}
            </div>
        </div>
    )
}

export default layout
