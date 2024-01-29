from flask import Flask , render_template , redirect , url_for , request , jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import re
import string
import joblib
import sklearn
import nltk 
import urllib
import gensim
import requests
from bs4 import BeautifulSoup
#nltk.download('stopwords')
import urllib3


# load the dataframe 
df = pd.read_csv('./static/Movies_Inf.csv',lineterminator='\n')


def recommend2(movie):
    # Load the array
    similarity_score = np.load('./static/similarity_scores.npy')
    # getting index of the searched movie
    index = df[df['Title']==movie].index[0]
    # finding the similiarity score of that movie with every other movies
    distance = similarity_score[index]
    # sorting them in descending order on the basis of similiarity score
    simi_mvs_idxWithname = sorted(list(enumerate(similarity_score[index])),reverse=True,key=lambda x:x[1])[1:6]
    
    simi_movies = {}
    for i in simi_mvs_idxWithname:
         simi_movies[df.loc[i[0],'Title']] = df.loc[i[0],'poster_path']     
    return simi_movies

# SENTIMENTAL ANALYSIS
def sentiment(imdb_id):#imdb_id should be in string
    # load the NLP Model
    model = joblib.load('./static/model.joblib')
    # Load the word2vec model
    word2vec = joblib.load('./static/word2vec.joblib')

    # FETCHING OF REVIEWS    

    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    url = 'https://www.imdb.com/title/{}/reviews?ref_=tt_ov_rt'.format(imdb_id)

    # Send a GET request with SSL certificate verification disabled
    response = requests.get(url, verify=False)

    # Parse the HTML content using BeautifulSoup
    soup = BeautifulSoup(response.content, 'lxml')

    # Find all div elements with class "text show-more__control"
    soup_result = soup.find_all("div", {"class": "text show-more__control"})

    for i in range(len(soup_result)):
      soup_result[i] = re.sub('\n',' ',str(soup_result[i]))

    reviews = []
    for i in soup_result:
        review = re.findall('<div class="text show-more__control">(.+)<\/div>', str(i))
        # appending in the form of String because the output of re.findall is list ! 
        reviews.append(review[0])


    #function to remove Emoji from the review
    def rmv_emoji(text):
        emoji_pattern = re.compile("["
                              u"\U0001F600-\U0001F64F"  # emoticons
                              u"\U0001F300-\U0001F5FF"  # symbols & pictographs
                              u"\U0001F680-\U0001F6FF"  # transport & map symbols
                              u"\U0001F1E0-\U0001f7e0"  # flags (india)
                              u"\U00002702-\U000027B0"
                              u"\U000024C2-\U0001F251"
                              "]+", flags=re.UNICODE)
        return emoji_pattern.sub(r'', text)

    #Function to remove html tags
    def rem_html_tgs(text):
        pattern = re.compile('<.*?>')
        return pattern.sub(r'',text)

    # Function to remove punctuation 
    import string 
    punc_marks = string.punctuation
    def rem_punc(text):
        return text.translate(str.maketrans('', '', punc_marks))

    # Function for Stemming
    from nltk.stem import PorterStemmer
    ps = PorterStemmer()
    def stemming(text):
        new_text = []
        
        for i in text.split():
            new_text.append(ps.stem(i))
        
        return " ".join(new_text)

    # Function to remove stop Words
    from nltk.corpus import stopwords
    stop_words = stopwords.words('english')

    def rmv_stopwrds(text):
        new_text = []
        for i in text.split():
          if i in stop_words:
            continue
          else:
            new_text.append(i)
          
        return " ".join(new_text)


    #Function that performs all type of Pre-Processing
    def text_preprocess(text):
      text = text.lower()
      text = rem_html_tgs(text)
      text = rmv_emoji(text)
      text = rem_punc(text)
      text = stemming(text)
      text = rmv_stopwrds(text)
      return text

    pre_process_reviews = [text_preprocess(i) for i in reviews]

    
    def document_vector(doc):
        doc = [word for word in doc.split() if word in word2vec.wv.index_to_key]
        return np.mean(word2vec.wv[doc],axis=0)

    X = []
    for i in pre_process_reviews:
        X.append(document_vector(i))

    sentiment = model.predict(X)

    no_of_neg = 0
    no_of_pos = 0
    for i in range(len(sentiment)):
      if(sentiment[i]==0):
          no_of_neg = no_of_neg + 1
      if(sentiment[i]==1):
        no_of_pos = no_of_pos + 1

    sum = no_of_pos + no_of_neg 
    pos_per = no_of_pos / sum * 100
    neg_per = no_of_neg / sum * 100

    return pos_per , neg_per 


def get_movies(genre,n=10):
    genre_df = pd.read_csv('./static/Genre_DataFrame.csv')
    temp = genre_df[genre_df[genre]==1][['Title','poster_path']].reset_index(drop=True)
    
    ans = {}
    for i in range(n): 
        ans[temp.loc[i,'Title']]='https://image.tmdb.org/t/p/w500/'+temp.loc[i,'poster_path']
    
    return ans


# FLASK APP 
app = Flask(__name__)
CORS(app)

@app.route('/')
def welcome():
    return render_template('index.html')

@app.route('/search.html')
def search():
    return render_template('search.html')

@app.route('/details.html')
def details():
    return render_template('details.html')

@app.route('/top_50.html')
def top_50():
    return render_template('top_50.html')

@app.route('/genre.html')
def genre():
    return render_template('genre.html')

@app.route('/movie_name',methods=['POST','GET'])
def temp():
    data = request.json
    # fetching name of the movie
    mv_name = str(data["term"])
    print(mv_name)
    recommended_movies = recommend2(mv_name)
    print(recommended_movies)

    # return jsonify(pct)
    return {"recommended_movies":recommended_movies}

@app.route('/percentage',methods=['GET','POST'])
def reviews_sentiment():
    data = request.json
    mv_name = str(data["term"])
    print(mv_name)
    # finding imdb_id
    imdbID = df[df['Title']==mv_name]['imdb_id'].iloc[0]
    
    pct = sentiment(str(imdbID))
    print(pct[0])
    print(pct[1])
    
    return {"pct":pct}

@app.route('/genre_based_movies',methods=['POST','GET'])
def genre_based_movies():
    data = request.json
    # fetching genre
    genre_name = str(data["term"])
    print(genre_name)
    mvs_accTO_genre = get_movies(genre_name)
    print(mvs_accTO_genre)

    # return jsonify(pct)
    return {"genre_movies":mvs_accTO_genre}

@app.route('/genre_details.html')
def chalu_kar_de_bhai():
    return render_template('genre_details.html')


if __name__ == "__main__":
    app.run(debug=True)