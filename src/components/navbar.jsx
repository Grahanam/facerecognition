import React from "react"
import {Link} from "react-router-dom"

const Navbar=()=>{
    return(
        <>
        <div className="navbar">
            <div>
            <span><Link to="/">Home</Link></span>
            <span><Link to="/save">SaveFace</Link></span>
            </div>
            <div><h4>Face Recognition</h4></div>
        </div>
        </>

    )
}

export default Navbar