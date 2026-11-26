"use client";
import { useRef, useState } from "react";
import { DistortionWave, type DistortionWaveHandle } from "distortion-waves";
import styles from "./comicReader.module.css";
export function CopyWallet({network,address}:{network:string;address:string}){
 const wave=useRef<DistortionWaveHandle>(null),button=useRef<HTMLButtonElement>(null);
 const [copied,setCopied]=useState(false),[error,setError]=useState(false);
 return <DistortionWave ref={wave} type="center" palette={{colors:[[1,.8,.12],[1,.5,.04],[1,.67,.08]],ahead:[1,.9,.3],behind:[1,.35,.03]}} live={false} resolution={1} style={{width:"100%",background:"#090c09"}} overlay={<button ref={button} className={styles.copyTrigger} onClick={async()=>{try{await navigator.clipboard.writeText(address);setCopied(true);setError(false);wave.current?.play({source:button});}catch{setError(true);}}}>{network}<span>{error?"SELECT ADDRESS BELOW":copied?"COPIED":"COPY ADDRESS"}</span></button>}>
  <div className={styles.walletBody}><code>{address}</code></div>
 </DistortionWave>;
}
