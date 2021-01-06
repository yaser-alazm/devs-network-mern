import React from "react";

export default () => {
  return (
    <footer className="text-center p-2 mt-5 mb-0 text-light bg-secondary">
      {/* Copyright &copy; {new Date().getFullYear()} DevsNetwork */}
      <div className="footer text-center">
          Developed By {' '}
          <span className="font-weight-normal">
            <a
            href="http://www.yaser-alazm.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-warning footer-name"
          >
             Yaser AlAzm
          </a>
          </span>
          {' '}
           Using <i className="fab fa-react" /> ReactJS &amp; ReduxJS for UI app and MERN Techs for NodeJs API
        </div>
    </footer>
  );
};
