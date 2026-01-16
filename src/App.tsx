import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Entry from '@/pages/Entry'
import Home from '@/pages/Home'
import ObjectList from '@/pages/ObjectList'
import PhraseList from '@/pages/PhraseList'
import QuizObjects from '@/pages/QuizObjects'
import QuizPhrases from '@/pages/QuizPhrases'
import Settings from '@/pages/Settings'

const App = () => {
  return (
    <BrowserRouter basename="/langlearn">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz/phrases" element={<QuizPhrases />} />
        <Route path="/quiz/objects" element={<QuizObjects />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/phrases" element={<PhraseList />} />
        <Route path="/settings/objects" element={<ObjectList />} />
        <Route path="/entry" element={<Entry />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
