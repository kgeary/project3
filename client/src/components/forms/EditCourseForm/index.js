import React, { useEffect } from "react";
import { Container } from "../../Grid";
import alertFactory from "../../../utils/alertFactory";
import API from "../../../utils/API";
import { useStoreContext } from "../../../utils/GlobalState";
import InputForm from "../InputForm";

function EditCourseForm(props) {
  const formAlert = alertFactory("alert");
  const [state] = useStoreContext();
  const course = props.user;

  const handleSubmit = e => {
    e.preventDefault();
    let update = false;
    const errors = [];

    const title = document.getElementById("title").value.trim();
    if (title.length < 3) {
      errors.push("Course Title is Too Short!");
    }

    const location = document.getElementById("location").value.trim();

    const cost = parseInt(document.getElementById("cost").value.trim());
    if (isNaN(cost) || cost < 0) {
      errors.push("Cost must be a number greater than or equal to 0");
    }

    const capacity = parseInt(document.getElementById("capacity").value.trim());
    if (isNaN(capacity) || capacity < 1) {
      errors.push("Capacity must be a number greater than 0");
    }

    const TeacherId = document.getElementById("teacher").value;

    if (errors.length > 0) {
      formAlert(errors.join("<br>"));
    } else {
      formAlert(false);
      const body = { title, location, capacity };
      body.TeacherId = TeacherId ? TeacherId : null;
      API.editCourse(props.user.id, body)
        .then(res => {
          console.log("COURSE UPDATED", res.data);
          update = true;
        })
        .catch(err => {
          if (err.message) {
            formAlert(err.message);
          } else {
            console.log(err);
            formAlert("Course Already Exists!");
          }
        })
        .finally(() => {
          props.closeModal(update);
        });
    }
  };
  useEffect(() => {
    document.getElementById("title").value = course.title;
    document.getElementById("location").value = course.location;
    document.getElementById("capacity").value = course.capacity;
    document.getElementById("cost").value = course.cost;
    document.getElementById("teacher").value = course.TeacherId ? course.TeacherId : "";
  }, []);

  return (
    <Container>
      <div className='close-modal'>
        <i
          className='far fa-times-circle'
          onClick={() => {
            props.closeModal(false);
          }}
        ></i>
      </div>
      <h1>Edit Course</h1>
      <form className='form-group'>
        {/* TITLE */}
        <label htmlFor='title'>Title:</label>
        <InputForm
          id='title'
          type='text'
          length='64'
          defaultValue={course.title}
        />

        {/* LOCATION */}
        <label htmlFor='name'>Location:</label>
        <InputForm
          id='location'
          type='text'
          length='32'
          placeholder='Class Location'
          defaultValue={course.location}
        />

        {/* COST */}
        <label htmlFor='cost'>Cost:</label>
        <InputForm
          id='cost'
          type='number'
          length='8'
          placeholder='Cost of Class'
          defaultValue={course.cost}
        />

        {/* CAPACITY */}
        <label htmlFor='capacity'>Capacity:</label>
        <InputForm
          id='capacity'
          type='number'
          length='4'
          placeholder='Max Capacity'
          defaultValue={course.capacity}
        />

        <label htmlFor='teacher'>Teacher:</label>
        <select className='form-control' id='teacher'>
          <option key={null} value=''>
            None
            </option>
          {state.users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <button
          id='submitEditAccount'
          className='btn btn-success mt-3'
          onClick={handleSubmit}
        >
          <i className='fas fa-user-plus'></i> Update Account Info
          </button>
      </form>
    </Container>
  );
}

export default EditCourseForm;