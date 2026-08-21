'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Home() {
  const [status, setStatus] = useState('Testing Supabase connection...')

  useEffect(() => {
    async function testSupabase() {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('event_categories')
        .select('id, name')
        .order('name')

      if (error) {
        console.error('Supabase error:', error)
        setStatus(`Connection failed: ${error.message}`)
        return
      }

      setStatus(
        `Connected successfully. Found ${data?.length ?? 0} event categories.`
      )
    }

    testSupabase()
  }, [])

  return (
    <main style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1>Charalavandlapalli</h1>

      <p>Village Community Portal</p>

      <hr />

      <h2>Supabase Connection</h2>

      <p>{status}</p>
    </main>
  )
}