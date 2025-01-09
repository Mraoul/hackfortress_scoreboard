import React, { useEffect } from 'react'

import AdminDashboard from './AdminDashboard'
import ContestantDashboard from './ContestantDashboard'
import { useSession } from '../helpers/Session'
import Loading from '../layout/Loading'

const Dashboard = ({}) => {
  const session = useSession()

  if (session.user == undefined) {
    return <Loading />
  }

  if (['admin', 'judge'].includes(session.user!.role)) {
    return (
      <div>
        <AdminDashboard />
      </div>
    )
  } else {
    return (
      <div>
        <ContestantDashboard />
      </div>
    )
  }
}

Dashboard.propTypes = {}

export default Dashboard
