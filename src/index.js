const axios = window.axios

axios.get('/api').then((res)=>{
    console.log(res.data)
})
