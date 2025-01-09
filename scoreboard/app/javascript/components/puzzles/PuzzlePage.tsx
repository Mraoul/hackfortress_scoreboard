import React, {
  Component,
  useState,
  useEffect,
  useRef,
  useContext,
} from 'react'
import PropTypes from 'prop-types'
import update from 'immutability-helper'

import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'

import NavBar from '../../layout/NavBar'
import StatusBar from './StatusBar'
import Category from './Category'
import Loading from '../../layout/Loading'
import { useSession } from '../../helpers/Session'
import { makeFetch } from '../../helpers/MakeFetch'
import type { ColorType } from '../def'

import type {
  RoundInterface,
  ParticpantInterface,
  CategoriesInterface,
  PlayersInterface,
  SolvedInterface,
} from './def'

export const PuzzlePage = ({}) => {
  const [loaded, setLoaded] = useState(false)
  const [round, setRound] = useState<RoundInterface | undefined>(undefined)
  const [participant, setParticipant] = useState<
    ParticpantInterface | undefined
  >(undefined)
  const [categories, setCategories] = useState<CategoriesInterface | undefined>(
    undefined
  )
  const [solved, setSolved] = useState<SolvedInterface | undefined>(undefined)
  const [players, setPlayers] = useState<PlayersInterface | undefined>(
    undefined
  )
  const [gameTime, setGameTime] = useState<number | undefined>(undefined)
  const [eventUrl, setEventUrl] = useState<string | undefined>(undefined)
  const eventHandlerRef = useRef<((e: any) => void) | null>(null)

  const session = useSession()

  useEffect(() => {
    if (session.user !== undefined && session.user.color !== undefined) {
      instantiateData()
    } else if (!loaded) {
      setLoaded(true)
    }
  }, [session.user])

  useEffect(() => {
    // Update reference to function every render
    eventHandlerRef.current = handleEvent
  })

  useEffect(() => {
    if (eventUrl != undefined && eventHandlerRef.current != null) {
      const updateSrc = new EventSource(eventUrl)
      const eventHandler = eventHandlerRef.current as (e: any) => void
      updateSrc.addEventListener(
        'update',
        (e) => {
          eventHandler(e)
        },
        false
      )

      updateSrc.onerror = function (e) {
        console.log(e)
      }

      return () => {
        console.log('Closing Event Source')
        updateSrc.close()
      }
    }
  }, [eventUrl])

  const instantiateData = async () => {
    await makeFetch({
      url: `api/roundpuzzles/${session.user!.color}`,
      successFn: (data) => {
        if (Object.keys(data).length > 0) {
          setRound(data.round)
          setParticipant(data.participant)
          setCategories(data.categories)
          setSolved(data.solved)
          setPlayers(data.players)
          setGameTime(data.gameTime)

          // Create listener to handle updates if round is active
          if (data.hasOwnProperty('participant')) {
            setEventUrl(`/stream/updates/${data.participant.color}`)
          }
        }
      },
    })

    setLoaded(true)
  }

  interface unlockPuzzleArgsInterface {
    id: number
    name: string
    data: string
    points: number
    desc: string
    author: string
    data_source: string
  }

  const unlockPuzzle = ({
    id,
    name,
    data,
    points,
    desc,
    author,
    data_source,
  }: unlockPuzzleArgsInterface) => {
    const keys = Object.keys(categories!)

    for (const key of keys) {
      for (var i = 0; i < categories![key].puzzles.length; i++) {
        const puzzle = categories![key].puzzles[i]
        if (puzzle.id == id && puzzle.status == 'locked') {
          const updated_puzzle = update(puzzle, {
            $merge: {
              status: 'unlocked',
              name: name,
              data: data,
              points: points,
              description: desc,
              author: author,
              data_source: data_source,
            },
          })
          setCategories((old_categories) =>
            update(old_categories, {
              [key]: { puzzles: { [i]: { $set: updated_puzzle } } },
            })
          )
          return
        }
      }
    }
  }

  const updateHints = (hintDiff: number) => {
    setParticipant((old_participant) =>
      update(old_participant, {
        hints: { $set: old_participant!.hints + hintDiff },
      })
    )
  }

  const updateSolved = (id: number, player: string) => {
    setSolved((old_solved) => update(old_solved, { [id]: { $set: player } }))
  }

  const handleEvent = (e: any) => {
    //TODO FIXME XXX
    let message = JSON.parse(e.data)
    console.log(message)
    switch (message.type) {
      case 'hint':
        // message.quantity is the difference of hints
        updateHints(message.quantity)
        break
      case 'solved':
        updateSolved(message.puzzle, message.player)
        break
      // case "status_add":
      //   // notify_alert('status_add')
      //   console.log("Alert" + "")
      //   break
      // case "status_remove":
      //   // notify_alert('status_remove');
      //   break
      case 'unlock':
        unlockPuzzle({
          id: message.puzzle_id,
          name: message.puzzle_name,
          data: message.puzzle_loc,
          points: message.puzzle_points,
          desc: message.puzzle_desc,
          author: message.puzzle_author,
          data_source: message.puzzle_gcloud,
        })
        break
      default:
        console.log('Recieved unexpected message')
    }
  }

  if (session.user === undefined) {
    return <Loading />
  }

  let pageContent

  if (!loaded) {
    pageContent = <Loading />
  } else if (round == undefined) {
    pageContent = (
      <Container>
        <Typography align="center" variant="h6">
          No Round Active
        </Typography>
      </Container>
    )
  } else {
    let isJudge = false
    if (['admin', 'judge'].includes(session.user!.role)) {
      isJudge = true
    }

    let render_categories: Array<React.ReactNode> = []
    Object.keys(categories!).map(function (key, index) {
      render_categories.push(
        <Category
          key={categories![key].id}
          name={key}
          puzzles={categories![key].puzzles}
          players={players}
          team_id={participant!.id}
          solved={solved}
          isJudge={isJudge}
        />
      )
    })

    pageContent = (
      <Container>
        <StatusBar
          color={participant!.color}
          hints={participant!.hints}
          round={round}
          gameTime={isJudge ? gameTime : undefined}
        />
        <Container>{render_categories}</Container>
      </Container>
    )
  }

  let navBar = (
    <NavBar
      color={session.user!.color as ColorType | undefined}
      changeColorCb={instantiateData}
    />
  )

  return (
    <div id={'puzzle-page'}>
      {navBar}
      {pageContent}
    </div>
  )
}

PuzzlePage.propTypes = {}

export default PuzzlePage
