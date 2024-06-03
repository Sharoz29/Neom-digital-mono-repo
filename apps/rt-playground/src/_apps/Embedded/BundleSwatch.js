import React, { useState, useRef, useEffect, useCallback } from "react";
import "./BundleSwatch.css";

/**
 * Standardized component to handle a swatch.
 */
export const BundleSwatch = (props) => {
  const {
    play,
    level,
    channels,
    channels_full,
    banner,
    internetSpeed,
    extra_calling,
    price
  } = props.config;

  return (
<div>
<div className="cc-swatch-header">
    <div className="cc-swatch-package">
        <div className="cc-swatch-play">
          {play}
        </div>
        <div className="cc-swatch-level"> 
            {level}
        </div>
    </div>
    <div className="cc-swatch-channels">
        <div className="cc-swatch-count">
            {channels}
        </div>
        <div className="cc-swatch-label">
            Channels
        </div>
    </div>
</div>
<div className="cc-swatch-body">
    <div className="cc-swatch-banner">
        {banner}
    </div>
    <ul>
        <li>{channels_full} channels plus FREE HD</li>
        <li>Thousands of On Demand choices</li>
        <li>Watch on the Cable Connect App</li>
        <li>Up to {internetSpeed} Internet Speeds</li>
        <li>Unlimited nationwide calling {extra_calling}</li>
    </ul>

    <div className="cc-swatch-price">
        <div className="cc-swatch-from-group">
            <div className="cc-swatch-from">From</div>
            <div className="cc-swatch-currency">$</div>
        </div>

        <div className="cc-swatch-dollars">{price.substring(0, price.indexOf("."))}</div>
        <div className="cc-swatch-monthly">
            <div className="cc-swatch-cents">{price.substring(price.indexOf(".") + 1)}</div>
            <div>for 12 months</div>
            <div>when bundled</div>
        </div>
    </div>
    <div>
        <button className="cc-swatch-shop-button" onClick={ () => props.onClick(level)}>SHOP NOW</button>
    </div>
</div>
</div>  
  );
};
