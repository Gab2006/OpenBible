import { createClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push'
import { corsHeaders } from '../_shared/cors.ts'

// Configura web-push con le chiavi VAPID dalle variabili d'ambiente
const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:test@example.com'
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') ?? ''
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

// 365 popular Bible verses for "Verse of the Day"
// We pick one deterministically based on the day of the year.
const versesOfTheDay = [
  { bookId: 'GEN', chapter: 1, verse: 1, text: 'Nel principio Iddio creò i cieli e la terra.' },
  { bookId: 'JHN', chapter: 3, verse: 16, text: 'Poiché Iddio ha tanto amato il mondo, che ha dato il suo unigenito Figliuolo, affinché chiunque crede in lui non perisca, ma abbia vita eterna.' },
  { bookId: 'PSA', chapter: 23, verse: 1, text: 'L\'Eterno è il mio pastore; nulla mi mancherà.' },
  // ... In a real app we'd have 365. For this example, we just pick from a few.
  { bookId: 'ROM', chapter: 8, verse: 28, text: 'Or noi sappiamo che tutte le cose cooperano al bene di quelli che amano Iddio, i quali son chiamati secondo il suo proponimento.' },
  { bookId: 'PHP', chapter: 4, verse: 13, text: 'Io posso ogni cosa in colui che mi fortifica.' }
]

function getVerseOfTheDay() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000)
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor(diff / oneDay)
  return versesOfTheDay[dayOfYear % versesOfTheDay.length]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Call the RPC to get users whose time has come
    const { data: subscriptions, error } = await supabase.rpc('get_subscriptions_due_for_notification')

    if (error) throw error

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscriptions due right now.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const verse = getVerseOfTheDay()
    const payload = JSON.stringify({
      title: 'Versetto del giorno',
      body: verse.text,
      url: `/#/reader/${verse.bookId}/${verse.chapter}/${verse.verse}`
    })

    const removePromises: Promise<any>[] = []

    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub.subscription, payload)
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription has expired or is no longer valid, remove it
          removePromises.push(
            supabase.from('push_subscriptions').delete().eq('id', sub.id)
          )
        } else {
          console.error('Error sending push:', err)
        }
      }
    }

    await Promise.all(removePromises)

    return new Response(JSON.stringify({ success: true, sent: subscriptions.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
