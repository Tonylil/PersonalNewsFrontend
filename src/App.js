import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import {setUserToken, resetNYTimesContent} from './Redux/actions.js';
import './App.css';
import NavBar from "./Navbar/NavBar.js";
import MainPage from "./News/MainPage.js";
import Login from "./Navbar/Login.js";
import Signup from "./Navbar/Signup.js"
import { Route, Switch, withRouter } from 'react-router-dom';

import {NYTimes_API_KEY} from "./api_key.js"

function App(props) {
  //Functions used to pre render details on the screen
  const getTokenFromLocalStoreage = () => {
    let token = localStorage.getItem("token")
    console.log("token from local storage: ", token, props.login)
    if (token && !props.login)
    {    //If we are already logged in, no need to do another fetch
        fetch('http://localhost:3000/tokenlogin', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({token: token})
      })
      .then(r => r.json())
      .then(respond => {
        props.setUserToken(respond.user, token)

      })
    }
  }

  //Useeffect is called everytime it's loaded.
  useEffect(() => {
    getTokenFromLocalStoreage();

    console.log("API Key: ", NYTimes_API_KEY)
    fetch(`https://api.nytimes.com/svc/search/v2/articlesearch.json?q=election&api-key=${NYTimes_API_KEY}`)
    .then(r => r.json())
    .then(respond => {
      console.log(respond.response.docs);
      let articleFormatted = respond.response.docs.map((article) => {
        let title = article.headline.main;
        let author = article.byline.original;
        let url = article.web_url;
        let content = article.abstract;

        return {
          title: title,
          author: author,
          url: url,
          content: content,
        };
      })
      console.log("Formated", articleFormatted)
      props.resetNYTimesContent(articleFormatted);
    })
  }, []) 
  //useEffect(()=>{},[]) If passing a second argument (array), 
  //React will run the callback after the first render and 
  //every time one of the elements in the array is changed. 
  //for example when placing useEffect(() => console.log('hello'), [someVar, someOtherVar]) - the callback will run after the first render and after any render that one of someVar or someOtherVar are changed.

  return (
    <div className="App">
      <Route path="/" component={NavBar} />
      <Switch>
        <Route path="/" exact component={MainPage} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
      </Switch>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    login: state.login,
  }
}

const mapDispatchToProps = dispatch => {
  const settingUser = (user, token) => {
    dispatch(setUserToken(user, token));
  }
  const settingNYTimesData = (articles) => {
    dispatch(resetNYTimesContent(articles))
  }
  return {
    setUserToken: settingUser,
    resetNYTimesContent: settingNYTimesData,
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(App));
