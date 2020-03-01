import React, { useEffect } from "react";
import { Col, Row, Container } from "../components/Grid";
import { useStoreContext } from "../utils/GlobalState";
import * as ACTIONS from "../utils/actions";
import Hero from "../components/Hero";

function Home() {
  const [state, dispatch] = useStoreContext();

  useEffect(() => {
    dispatch({ type: ACTIONS.DONE });
  }, []);

  return <Hero />;
}

export default Home;
