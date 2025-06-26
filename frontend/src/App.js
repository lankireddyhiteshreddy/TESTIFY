import React from 'react';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TestCreate from './pages/TestCreate';
import PrivateRoute from './context/privateRoute';
import TestSummary from './pages/TestSummary';
import QuestionCreate from './pages/QuestionCreate';
import QuestionsSummary from './pages/QuestionsSummary';
import DisplayTests from './pages/DisplayTests';
import OAuthSuccess from './pages/OAuthSuccess';
import TestScreen from './pages/TestScreen';
import AnswerKeyUpload from './pages/AnswerKeyUpload';
import FinalEvaluation from './pages/FinalEvaluation';
import Profile from './pages/Profile';
import TestResults from './pages/TestResults';
import PublicTests from './pages/PublicTests';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/dashboard' element={<PrivateRoute><Dashboard/></PrivateRoute>}/>
        <Route path='/create-test' element = {<PrivateRoute><TestCreate/></PrivateRoute>}/>
        <Route path="/tests/:test_id/summary" element = {<PrivateRoute><TestSummary /></PrivateRoute>}/>
        <Route path="/tests/:test_id/add-questions" element= {<PrivateRoute><QuestionCreate /></PrivateRoute>}/>
        <Route path="/tests/:test_id/questions-summary" element={<PrivateRoute><QuestionsSummary/></PrivateRoute>}/>
        <Route path="/tests" element={<PrivateRoute><DisplayTests /></PrivateRoute>} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/tests/edit/:test_id" element={<PrivateRoute><TestCreate/></PrivateRoute>}/>
        <Route path="/test/live/:test_id" element={<PrivateRoute><TestScreen /></PrivateRoute>} />
        <Route path="/tests/:test_id/upload-key" element={<PrivateRoute><AnswerKeyUpload/></PrivateRoute>}/>
        <Route path="/tests/:attempt_id/evaluate/final" element={<PrivateRoute><FinalEvaluation/></PrivateRoute>}/>
        <Route path="/dashboard/profile" element={<PrivateRoute><Profile/></PrivateRoute>}></Route>
        <Route path="/:test_id/results" element={<PrivateRoute><TestResults/></PrivateRoute>}></Route>
        <Route path="/public-tests" element = {<PrivateRoute><PublicTests/></PrivateRoute>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
