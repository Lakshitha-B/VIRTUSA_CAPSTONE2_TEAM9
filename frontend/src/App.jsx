
import { useState } from "react";
import FileUpload from "./components/fileUpload";
import FileList from "./components/FileList";

function App() {
  const [showFileList, setShowFileList] = useState(false);

  return (
    <div>
      {showFileList ? (
        <FileList />
      ) : (
        <FileUpload
          onUploadSuccess={() => setShowFileList(true)}
        />
      )}
    </div>
  );
}

export default App;
