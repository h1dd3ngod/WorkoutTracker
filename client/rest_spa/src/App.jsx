import { useState, useEffect } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./styles/App.sass";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    Modal,
    Button,
    Alert,
    Form,
    Accordion,
    Stack
} from "react-bootstrap";
import WorkoutForm from "./components/WorkoutForm";
import LogInForm from "./components/LogInForm";
import RegistrationForm from "./components/RegistrationForm";

function App() {
    const [retrievedData, setRetrievedData] = useState([]);
    const [taskDeleted, setTaskDeleted] = useState(false);
    const [taskSuccessfullyAdded, setTaskSuccessfullyAdded] = useState(false)
    const [jwt, setJwt] = useState('')
    const [userId, setUserId] = useState(null)

    const exerciseOptions = [
        "Barbell press",
        "Barbell squat",
        "Ez barbell curl",
        "Skull crusher",
        "Dips",
        "Pull-ups",
        "Shoulder press",
        "Lateral pulldowns",
        "Lateral raises"
    ]
    const delayTime = 3000
 
    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        if (storedToken)
            handleUserLogIn({token: storedToken})
    }, [])

    useEffect(() => {
        fetch("http://localhost:5000/api/workouts?id=" + userId, {
            headers: {
                'Authorization': localStorage.getItem("token"),
            },
        })
            .then((res) => {
                if (res.status === 401) {
                    handleUserLogIn({ token: "" });
                }
                return res.json()
            })
            .then((data) => {
                if (Array.isArray(data))
                    setRetrievedData(data);
                console.log(data);
            })
            .catch((err) => {
                console.error(err);
            });

    }, [userId]);

    useEffect(() => {
        let timeout
        if (taskDeleted) {
            timeout = setTimeout(() => {
                setTaskDeleted(false);
            }, delayTime)
        }
        return () => clearTimeout(timeout);
    }, [taskDeleted])

    useEffect(() => {
        let timeout;
        if (taskSuccessfullyAdded) {
            timeout = setTimeout(() => {
                setTaskSuccessfullyAdded(false);
            }, delayTime);
        }
        return () => clearTimeout(timeout);
    }, [taskSuccessfullyAdded]);

    function onNewWorkout(childState) {
        console.log(retrievedData)
        setRetrievedData(prev => [...prev, {id: prev.length > 0 ? prev.at(-1).id + 1 : 1, ...childState}])
        setTaskSuccessfullyAdded(true)
    }

    function handleTaskDeletion(event) {
        if (isNaN(event.target.id)) return
        console.log('Delete called (client)'+ event.target.id)
        fetch('http://localhost:5000/api/delete/' + event.target.id, {
            method: 'DELETE',
            headers: {
                'Authorization': localStorage.getItem("token"),
            },
        })
        // .then(response => console.log(response))
        .then((data) => {
            console.log(data)
            if (data.status == 204 || data.status == 200) { 
                setTaskDeleted(true)
                setRetrievedData(data => data.filter(workout => workout.id != event.target.id))
            }
            if (data.status === 401) {
                handleUserLogIn({ token: "" });
            }
        })
        .catch((error) => console.error(error))
    }

    function handleUserLogIn(jwt) {
        console.log(jwt)
        setJwt(jwt.token)
        localStorage.setItem('token', jwt.token)
        setUserId(jwt.userId)
    }

    return (
        <div>
            <header className="header">
                <h1>Workout tracker</h1>
            </header>
            {jwt ? 
            (<section className="workouts">
                <ul className="workout-list">
                    <li key="retrievedItems">
                        {taskDeleted && (
                            <Alert variant="danger">
                                Task successfully deleted!
                            </Alert>
                        )}
                        {taskSuccessfullyAdded && (
                            <Alert variant="success">
                                Task successfully added!
                            </Alert>
                        )}
                        <Accordion defaultActiveKey={null}>
                            {retrievedData.map((item) => {
                                return (
                                    <Accordion.Item
                                        eventKey={item.id}
                                        key={item.id}
                                    >
                                        <Accordion.Header
                                            className="flex-horizontal justify-content-around"
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-around",
                                            }}
                                        >
                                            <Stack
                                                direction="horizontal"
                                                gap={5}
                                            >
                                                <h2>
                                                    {new Date(
                                                        item.date
                                                    ).toLocaleDateString()}
                                                </h2>
                                                <h2>{item.title}</h2>
                                            </Stack>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <h2>Exercise:</h2>
                                            <p>
                                                {item.exercise}, {item.reps}
                                            </p>
                                            <Button
                                                variant="danger"
                                                onClick={handleTaskDeletion}
                                                id={item.id}
                                            >
                                                Delete
                                            </Button>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                );
                            })}
                        </Accordion>
                    </li>
                    <li className="new-workout" key="addNewItem">
                        <h1>Log a new workout:</h1>
                        <WorkoutForm
                            exerciseOptions={exerciseOptions}
                            onChildStateChange={onNewWorkout}
                            logOut={() => handleUserLogIn({token: ''})}
                            userId={userId}
                        />
                    </li>
                </ul>
            </section>
            ) : (
                <>
                    <section className="workouts">
                        <RegistrationForm/>
                    </section>
                    <section className="workouts">
                        <LogInForm
                            onUserLogIn={handleUserLogIn}
                        />
                    </section>
                </>
            )
            }

        </div>
    );
}

export default App;
