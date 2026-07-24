import { useParams } from "react-router-dom";

function MovieDetails() {
  // useParams достаёт динамическую часть адреса — то, что стоит вместо :id
  const { id } = useParams();

  return (
    <div className="container">
      <h1>Страница фильма</h1>
      <p>ID фильма: {id}</p>
    </div>
  );
}

export default MovieDetails;
