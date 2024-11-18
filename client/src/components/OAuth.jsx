import {GoogleAuthProvider, getAuth, signInWithPopup} from 'firebase/auth'
import { app } from '../firebase'
import { useDispatch } from 'react-redux'
import { signInSuccess } from '../redux/user/userSlice'
import { useNavigate } from 'react-router-dom'

export default function OAuth() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    async function handleGoogleClick() {
        try {
            const provider = new GoogleAuthProvider()
            const auth = getAuth(app)

            const result = await signInWithPopup(auth, provider)

            const res = await fetch('/user/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name: result.user.displayName, email: result.user.email, photo: result.user.photoURL})
            })
            const data = await res.json()
            dispatch(signInSuccess(data))
            navigate('/')
        } catch (error) {
            console.log("Could not sign In with Google", error)
        }
    }
  return (
    <button onClick={handleGoogleClick} type='button' className='bg-red-700 p-3 rounded-lg text-white uppercase hover:opacity-95'>continue with google</button>
  )
}
