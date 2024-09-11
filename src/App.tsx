import React, { useState } from "react";
import axios from "axios";

const JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJjMGVmMzg0ZS0wNWIzLTQ1NGEtYjE2Zi1hMmZjOTFkMWFhMjYiLCJlbWFpbCI6Im1pdTcxODBtaXVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjQwZGY2MDMyMWRlYTZmMjkxOGU0Iiwic2NvcGVkS2V5U2VjcmV0IjoiOGNhMTI5Y2NkYTcwZmYyNTIyMmQ2NmVjNTZmOGRhYjNlOWQ1YTRiMWY0Njc0MTA4ODFmOTgwMjllNDI3YzRhOSIsImV4cCI6MTc1NzEzODA4OX0.cjRP32OzOJbarMMRZGVVYG-FOAmo4q3xL5mGoq8Bryw";

function App() {
  const [videoName, setVideoName] = useState("");
  const [videoNumber, setVideoNumber] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [nextVideoUrl, setNextVideoUrl] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Uploading to IPFS...");

    if (!imageFile) {
      setMessage("Please select an image file.");
      return;
    }

    try {
      // 画像ファイルをPinataにアップロード
      const formData = new FormData();
      formData.append("file", imageFile);
      const imageResult = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: Infinity,
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${JWT}`, // JWTを文字列として指定
          },
        }
      );

      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageResult.data.IpfsHash}`;

      // メタデータの作成
      const metadata = {
        name: videoName,
        description: `This NFT certifies the completion `,
        image: imageUrl,
        attributes: [
          { trait_type: "Video Number", value: videoNumber },
          { trait_type: "Teacher Name", value: teacherName },
          { trait_type: "Next Video URL", value: nextVideoUrl },
        ],
      };

      // メタデータをPinataにアップロード
      const metadataResult = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          headers: {
            Authorization: `Bearer ${JWT}`, //
          },
        }
      );

      const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataResult.data.IpfsHash}`;

      setMessage(`Metadata uploaded successfully: ${metadataUrl}`);
      console.log("メタデータURI:", metadataUrl);
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      setMessage("Error uploading to IPFS. Check the console for details.");
    }
  };

  return (
    <div>
      <h1>教員用NFT作成フォーム</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>動画名:</label>
          <input
            type="text"
            value={videoName}
            onChange={(e) => setVideoName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>動画番号:</label>
          <input
            type="number"
            value={videoNumber}
            onChange={(e) => setVideoNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label>教員名:</label>
          <input
            type="text"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            required
          />
        </div>{" "}
        <div>
          <label>次の動画のURL:</label> {/* 新しく追加 */}
          <input
            type="url"
            value={nextVideoUrl}
            onChange={(e) => setNextVideoUrl(e.target.value)}
          />
        </div>
        <div>
          <label>画像:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            required
          />
        </div>
        <button type="submit">メタデータを登録してURLを取得する</button>
      </form>
      <p>{message}</p>
    </div>
  );
}

export default App;
