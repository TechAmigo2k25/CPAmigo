import axios from "axios";
  const URL="https://cpamigo.onrender.com";

  export const login_user_api= async (data)=>{

    try{
          return await axios.post(`${URL}/api/v1/auth/login`,data);
    }catch(error)
    {
        return error;
    }
}
 export const register_user= async (data)=>{

    try{
          return await axios.post(`${URL}/api/v1/auth/register`,data);
    }catch(error)
    {
        return error;
    }
}

export const get_students= async()=>{
  try{

    const token = localStorage.getItem("token");
    return await axios.get(`${URL}/api/v1/user/getstudents`,
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }catch(error)
  {
    return error;
  }
}

export const update_students= async(data,id)=>{
  try{

    const token = localStorage.getItem("token");
    return await axios.post(`${URL}/api/v1/user/updateuser/${id}`,data,
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }catch(error)
  {
    return error;
  }
}

export const delete_student= async(id)=>{
  try{

    const token = localStorage.getItem("token");
    return await axios.delete(`${URL}/api/v1/user/deleteuser/${id}`,
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }catch(error)
  {
    return error;
  }
}

export const upload_problem= async(data)=>{
  try{

    const token = localStorage.getItem("token");
    return await axios.post(`${URL}/api/v1/user/uploadproblem`, data,
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }catch(error)
  {
    return error;
  }
}

export const get_problem= async()=>{
  try{

    const token = localStorage.getItem("token");
    return await axios.get(`${URL}/api/v1/user/getproblems`,
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }catch(error)
  {
    return error;
  }
}


export const update_problem= async(id,data)=>{
  try{

    const token = localStorage.getItem("token");
    return await axios.post(`${URL}/api/v1/user/updateproblem/${id}`, data,
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }catch(error)
  {
    return error;
  }
}


export const get_solved_count= async()=>{
  try{

    const token = localStorage.getItem("token");
    return await axios.get(`${URL}/api/v1/user/getcountsolvedproblems`,
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }catch(error)
  {
    return error;
  }
}

export const get_single_student= async(id)=>{
  try{

    const token = localStorage.getItem("token");
    return await axios.get(`${URL}/api/v1/user/getsinglestudent/${id}`,
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }catch(error)
  {
    return error;
  }
}

export const get_single_problem= async(ids)=>{
  try{

    const token = localStorage.getItem("token");
    return await axios.post(`${URL}/api/v1/user/getsingleproblem`,ids,
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }catch(error)
  {
    return error;
  }
}

export const submit_solution= async(data)=>{
  try{

    const token = localStorage.getItem("token");
    return await axios.post(`${URL}/api/v1/user/submitsolution`, data,
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }catch(error)
  {
    console.log(error);
    return error;
  }
}

export const add_quiz= async(data)=>{
  try{

    const token = localStorage.getItem("token");
    return await axios.post(`${URL}/api/v1/user/quiz/create`, data,
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }catch(error)
  {
    return error;
  }
}

export const get_all_quiz= async()=>{
  try{

    const token = localStorage.getItem("token");
    return await axios.get(`${URL}/api/v1/user/getAllquiz`,
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }catch(error)
  {
    return error;
  }
}

export const get_all_quiz_student= async()=>{
  try{

    const token = localStorage.getItem("token");
    return await axios.get(`${URL}/api/v1/user/student/getAllQuiz`,
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }catch(error)
  {
    return error;
  }
}

export const update_quiz= async(id,data)=>{
  try{

    const token = localStorage.getItem("token");
    return await axios.post(`${URL}/api/v1/user/quiz/update/${id}`,data,
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }catch(error)
  {
    return error;
  }
}

export const deleteQuiz= async(id)=>{
  try{

    const token = localStorage.getItem("token");
    return await axios.delete(`${URL}/api/v1/user/quiz/delete/${id}`,
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }catch(error)
  {
    return error;
  }
}


export const addSubmission=async (data)=>{

  try{

    const token = localStorage.getItem("token");
    const res= await axios.post(`${URL}/api/v1/user/quiz/addanswer`,data,
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return   {
      success: true,
      data: res.data,
      status: res.status
    };
  }catch(err)
  {
    return    {
      success: false,
      data: err.response?.data || { message: "Error" },
      status: err.response?.status
    };;
  }
}

export const getQuizStatus= async()=>{
  try{

    const token = localStorage.getItem("token");
    return await axios.post(`${URL}/api/v1/user/quiz/quizwithstatus`,{},
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }catch(error)
  {
    return error;
  }
}

export const get_quiz_count= async()=>{
  try{

    const token = localStorage.getItem("token");
    return await axios.get(`${URL}/api/v1/user/quiz/getquizcount`,
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }catch(error)
  {
    return error;
  }
}

export const get_student_progress= async(data)=>{
  try{

    const token = localStorage.getItem("token");
    return await axios.post(`${URL}/api/v1/user/getprogress`,data,
         {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
  }catch(error)
  {
    return error;
  }
}

//api for thr get list of pdf url from git repo
export const get_pdf_urls= async()=>{
  try{

    
    return await axios.get(`https://pushpak-jaiswal.github.io/DBATU-CP/catalog.json`);
  }catch(error)
  {
    return error;
  }
}