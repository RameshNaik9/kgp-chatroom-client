import React, { useState, useEffect } from "react";
import Login from "../components/Login";
import Signup from "../components/Signup";
import '../Styles/Home.css';

const Home = () => {
  const [activeForm, setActiveForm] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const container = document.querySelector('.container');
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left; // X position within the container
      const y = e.clientY - rect.top;  // Y position within the container

      // Calculate the distance from the center
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

      // Adjust the blur based on distance (closer to center = less blur)
      const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
      const blurAmount = 13 * (distance / maxDistance); // Adjust the blur scale if necessary

      // Apply the new blur amount
      container.style.setProperty('--blur-amount', `${blurAmount}px`);
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="container text-center">
      <div className="row">
        <div className="col ms-1">
          <div className="text-center">
            <h2 className="typing-text">Welcome to Kgp-Chat-Box</h2>
            <p>
              This is an amazing platform where you can connect and chat with others. Sign in or register to start using the platform and explore all the functionalities we offer.
            </p>
          </div>
        </div>
        <div className="col me-5">
          <div className="chatbox">
            <h3 className="my-3">Chat Box</h3>
            <button
              className="btn btn-primary mb-2 mx-3"
              onClick={() => setActiveForm("login")}
            >
              Login
            </button>
            <button
              className="btn btn-secondary mb-2 mx-3"
              onClick={() => setActiveForm("signup")}
            >
              Signup
            </button>
          </div>

          {activeForm === "login" && (
            <div className="card mt-3">
              <div className="card-body">
                <h5 className="card-title">Login</h5>
                <Login />
              </div>
            </div>
          )}
          {activeForm === "signup" && (
            <div className="card mt-3">
              <div className="card-body">
                <h5 className="card-title">Register</h5>
                <Signup />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
