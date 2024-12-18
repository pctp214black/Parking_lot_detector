import { useState } from "react"

export default function Prueba(){
    const [threshold,setThreshold]=useState(.5)
    const [timeGap,setTimeGap]=useState(1)
    const [numClusters,setNumClusters]=useState(2)
    const [thresholdMovement,setThresholdMovement]=useState(10)



    return(
        <>
            <div className="form_video">
                <form action="">
                    <div className="input_threshold">
                        <label>Threshold</label>
                        <input type="number" value={threshold} onChange={(e)=>setThreshold(e.target.value)}></input>
                    </div>
                    <div className="input_timeGap">
                        <label>Time Gap</label>
                        <input type="number" value={timeGap} onChange={(e)=>setTimeGap(e.target.value)}></input>
                    </div>
                    <div className="input_num_clusters">
                        <label>Number of Clusters</label>
                        <input type="number" value={numClusters} onChange={(e)=>setNumClusters(e.target.value)}></input>
                    </div>
                    <div className="input_threshold_movement">
                        <label>Threshold Movement</label>
                        <input type="number" value={thresholdMovement} onChange={(e)=>setThresholdMovement(e.target.value)}></input>
                    </div>
                    <div className="input_video">
                        <input type="file" />
                    </div>
                </form>
            </div>
        </>
    )
} 